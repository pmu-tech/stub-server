import express from 'express';
import { createProxyServer } from 'http-proxy';

import { fixRequestBody } from './fixRequestBody';
import { removeSecureFromSetCookie } from './removeSecureFromSetCookie';

const send = (
  target: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // [Proxy with express.js](https://stackoverflow.com/q/10435407)

  const proxy = createProxyServer({
    // Explanations: https://github.com/http-party/node-http-proxy/pull/1130
    changeOrigin: true,
    cookieDomainRewrite: req.hostname
  });

  proxy.on('proxyReq', fixRequestBody);
  proxy.on('proxyRes', removeSecureFromSetCookie);
  proxy.web(req, res, { target }, next);
};

export { send };
