// Rehearsals perform synchronous filesystem and Docker work between requests.
// During those pauses the peer can close an idle socket before this event loop
// processes its close event. Do not pool those sockets or retry ambiguous writes.
export function rehearsalFetch(input, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Connection', 'close');
  return fetch(input, { ...options, headers });
}
