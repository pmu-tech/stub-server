import http from 'http';

/**
 * Fix proxied body if bodyParser is involved.
 *
 * @see https://github.com/chimurai/http-proxy-middleware/blob/v2.0.1/src/handlers/fix-request-body.ts
 * @see https://github.com/chimurai/http-proxy-middleware/issues/320
 * @see https://github.com/chimurai/http-proxy-middleware/pull/492
 */
const fixRequestBody = (proxyReq: http.ClientRequest, req: http.IncomingMessage) => {
  const requestBody = (req as unknown as Request).body;

  if (!requestBody || Object.keys(requestBody).length === 0) {
    return;
  }

  const contentType = proxyReq.getHeader('Content-Type') as string;
  const writeBody = (bodyData: string) => {
    // deepcode ignore ContentLengthInCode: bodyParser fix
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  };

  if (contentType && contentType.includes('application/json')) {
    writeBody(JSON.stringify(requestBody));
  }

  if (contentType === 'application/x-www-form-urlencoded') {
    writeBody(new URLSearchParams(requestBody as unknown as string).toString());
  }
};

export { fixRequestBody };
