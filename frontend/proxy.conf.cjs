// Development only. Compose supplies its own backend service; native ng serve
// defaults to the local backend. Preserve Origin so its CORS allowlist applies.
const target = process.env.STARTRACK_PROXY_TARGET || 'http://127.0.0.1:8080';

module.exports = Object.fromEntries(
  ['/api', '/sybeUser', '/role', '/projectCreate', '/projectUpdate'].map((route) => [route, {
    target,
    changeOrigin: false,
    ws: false,
    secure: true,
    logLevel: 'warn',
  }])
);
