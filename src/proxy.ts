import express from 'express';
import { createProxyServer } from 'http-proxy';

const proxy = createProxyServer({ changeOrigin: true });

// Exported for testing purposes only, see [Jest mock inner function](https://stackoverflow.com/q/51269431)

// istanbul ignore next
export const send = (
  target: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => proxy.web(req, res, { target }, next);
