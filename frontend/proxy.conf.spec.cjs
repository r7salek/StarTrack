const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');

function config(target) {
  const previous = process.env.STARTRACK_PROXY_TARGET;
  try {
    if (target === undefined) delete process.env.STARTRACK_PROXY_TARGET;
    else process.env.STARTRACK_PROXY_TARGET = target;
    delete require.cache[require.resolve('./proxy.conf.cjs')];
    return require('./proxy.conf.cjs');
  } finally {
    if (previous === undefined) delete process.env.STARTRACK_PROXY_TARGET;
    else process.env.STARTRACK_PROXY_TARGET = previous;
    delete require.cache[require.resolve('./proxy.conf.cjs')];
  }
}

test('native development defaults all API paths to the local backend', () => {
  const proxy = config();
  assert.deepEqual(Object.keys(proxy), ['/api', '/sybeUser', '/role', '/projectCreate', '/projectUpdate']);
  for (const options of Object.values(proxy)) assert.equal(options.target, 'http://127.0.0.1:8080');
});

test('an isolated stack uses its own backend without changing browser Origin', () => {
  for (const options of Object.values(config('http://backend:8080'))) {
    assert.equal(options.target, 'http://backend:8080');
    assert.equal(options.changeOrigin, false);
    assert.equal(options.ws, false);
    assert.equal(options.secure, true);
  }
});

test('Angular serve loads the proxy configuration', () => {
  const angular = JSON.parse(readFileSync(`${__dirname}/angular.json`, 'utf8'));
  assert.equal(angular.projects.StarTrack.architect.serve.options.proxyConfig, 'proxy.conf.cjs');
});
