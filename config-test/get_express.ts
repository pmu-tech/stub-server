import express from 'express';

export default function stub(req: express.Request, res: express.Response) {
  const { param } = req.params;
  switch (param) {
    case 'send':
      res.send({ param });
      break;
    case 'sendAsync':
      setTimeout(() => {
        res.send({ param });
      }, 500);
      break;

    // istanbul ignore next
    case 'status':
      res.status(202 /* Accepted */);
      break;

    case 'end':
      res.end();
      break;

    // istanbul ignore next
    case 'doNothing':
      break;

    default:
      // No param
      res.status(204).end();
  }
}
