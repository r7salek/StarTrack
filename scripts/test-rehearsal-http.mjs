import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { Worker } from 'node:worker_threads';
import { rehearsalFetch } from './rehearsal-http.mjs';

// Run the peer on an independent event loop: a same-thread test server cannot
// expire its sockets while the rehearsal is blocked in synchronous Docker/file IO.
async function server(t) {
  const counts = new Int32Array(new SharedArrayBuffer(8));
  const worker = new Worker(`
    const { parentPort, workerData } = require('node:worker_threads');
    const http = require('node:http');
    const counts = new Int32Array(workerData);
    let connection = 0;
    const server = http.createServer((req, res) => {
      if (req.method === 'POST') Atomics.add(counts, 0, 1);
      if (req.url === '/drop') { req.socket.destroy(); return; }
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        res.on('finish', () => setTimeout(() => req.socket.destroy(), 50));
        res.setHeader('Content-Type', 'application/json');
        // A peer may expire an idle connection earlier than it advertised.
        res.setHeader('Keep-Alive', 'timeout=600');
        res.end(JSON.stringify({ connection: req.socket.id, method: req.method,
          headers: req.headers, body }));
      });
    });
    server.keepAliveTimeout = 50;
    server.on('connection', socket => {
      socket.id = ++connection;
      socket.on('close', () => Atomics.add(counts, 1, 1));
    });
    server.listen(0, '127.0.0.1', () => parentPort.postMessage(server.address().port));
  `, { eval: true, workerData: counts.buffer });
  t.after(() => worker.terminate());
  const [port] = await once(worker, 'message');
  return { url: `http://127.0.0.1:${port}`, counts };
}

test('rehearsal requests preserve HTTP contracts and force non-pooled connections', async (t) => {
  const { url } = await server(t);
  const result = await (await rehearsalFetch(url, {
    method: 'POST', body: '{"synthetic":true}',
    headers: new Headers({ Authorization: 'Bearer synthetic',
      'Content-Type': 'application/json', Connection: 'keep-alive' }),
    signal: AbortSignal.timeout(2000),
  })).json();
  assert.equal(result.method, 'POST');
  assert.equal(result.body, '{"synthetic":true}');
  assert.equal(result.headers.authorization, 'Bearer synthetic');
  assert.equal(result.headers['content-type'], 'application/json');
  assert.equal(result.headers.connection, 'close');
});

test('a write succeeds after the peer closes sockets during synchronous rehearsal work', async (t) => {
  const { url, counts } = await server(t);
  const first = await (await rehearsalFetch(url)).json();
  // Model a synchronous file read or Docker command without yielding the client
  // event loop. The worker continues processing socket closure independently.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  assert.ok(Atomics.load(counts, 1) >= 1, 'peer must close the earlier socket');
  const second = await (await rehearsalFetch(url, {
    method: 'POST', body: 'synthetic write', signal: AbortSignal.timeout(2000),
  })).json();
  assert.notEqual(second.connection, first.connection);
  assert.equal(Atomics.load(counts, 0), 1, 'write must be sent exactly once');
});

test('an ambiguous failed write is surfaced without retrying it', async (t) => {
  const { url, counts } = await server(t);
  await assert.rejects(rehearsalFetch(`${url}/drop`, {
    method: 'POST', body: 'synthetic write', signal: AbortSignal.timeout(2000),
  }), /fetch failed/);
  assert.equal(Atomics.load(counts, 0), 1);
});

test('an already aborted request retains its cancellation signal', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(rehearsalFetch('http://127.0.0.1:1', {
    method: 'POST', signal: controller.signal,
  }), { name: 'AbortError' });
});
