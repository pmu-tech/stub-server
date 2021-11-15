import express from 'express';
import { createProxyServer } from 'http-proxy';

const proxy = createProxyServer({ changeOrigin: true });

export const send = (
  target: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // [request](https://github.com/request/request) can also be used:
  //
  // req.pipe(request(`${target}${req.url}`, next)).pipe(res);
  //
  // As of 2020/01/24
  // - http-proxy: 10861 stars, 7.8 kB min.gz, last release: 2019/09/18
  // - request: 23980 stars, 179.8 kB min.gz, last release: 2018/08/10, [deprecated](https://github.com/request/request/issues/3142)
  //
  // [Proxy with express.js](https://stackoverflow.com/q/10435407)

  proxy.web(req, res, { target }, next);
};
