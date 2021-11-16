import http from 'http';

/**
 * http-proxy does not remove 'Secure' attribute from Set-Cookie header.
 *
 * @see https://github.com/http-party/node-http-proxy/issues/1165
 * @see https://github.com/http-party/node-http-proxy/pull/1166
 */
const removeSecureFromSetCookie = (proxyRes: { headers: http.IncomingHttpHeaders }) => {
  // ["Header names are lower-cased"](https://nodejs.org/dist/latest-v16.x/docs/api/http.html#messageheaders)

  if (proxyRes.headers['set-cookie']) {
    const cookies = proxyRes.headers['set-cookie'].map(cookie => cookie.replace(/; secure/gi, ''));
    /* eslint-disable no-param-reassign */
    proxyRes.headers['set-cookie'] = cookies;
    /* eslint-enable no-param-reassign */
  }
};

export { removeSecureFromSetCookie };
