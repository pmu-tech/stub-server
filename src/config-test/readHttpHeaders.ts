import express from 'express';

export default function readHttpHeaders(req: express.Request, res: express.Response) {
  const { headers } = req;
  res.send({ headers });
}
