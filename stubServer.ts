import express from 'express';
import fs from 'fs';
import proxy from 'express-http-proxy';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type URL = string;
type StubFilename = string;

type Route = {
  [method in Method]?: URL | StubFilename;
};

export interface StubServerConfig {
  minDelay: number;
  maxDelay: number;
  routes: { [apiPath: string]: Route };
}

// Allows to modify the imported files without restarting the server
// See [node.js require() cache - possible to invalidate?](https://stackoverflow.com/a/16060619)
function deleteRequireCache(module: string) {
  delete require.cache[require.resolve(module)];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomDelay = (min: number, max: number) =>
  // We could do better by allowing different number distributions
  // See [Generate random number with a non-uniform distribution](https://stackoverflow.com/q/16110758)
  sleep(Math.floor(Math.random() * max) + min);

const isUrl = (str: string) => str.startsWith('http');

let _configPath: string;

function getConfig() {
  deleteRequireCache(_configPath);
  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(_configPath).default as StubServerConfig;
}

// FIXME See [proxy multipart request](https://github.com/villadora/express-http-proxy/issues/127)
function isMultipartRequest(req: express.Request) {
  const contentTypeHeader = req.headers['content-type'];
  return contentTypeHeader && contentTypeHeader.indexOf('multipart') > -1;
}

const sendToProxy = (host: string, req: express.Request, res: express.Response) =>
  new Promise<void>(resolve =>
    proxy(host, { parseReqBody: !isMultipartRequest(req) })(req, res, resolve)
  );

async function processStubRequest(
  apiPath: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  // Re-read the config file for each new request so the user
  // don't have to restart the stub server
  // except if he adds a new route which is acceptable
  const { minDelay, maxDelay, routes } = getConfig();
  const response = routes[apiPath][req.method.toLowerCase() as Method]!;

  console.log(`${req.method} ${req.url} => ${response}`);

  // Explicitly set a timer for all requests (stub and remote) to simulate users network
  await randomDelay(minDelay, maxDelay);

  if (isUrl(response)) {
    const url = `${response}${req.url}`;
    await sendToProxy(url, req, res);
  } else {
    const match = /_(\d+)_[a-zA-Z]+/.exec(response);

    if (match === null) {
      next(new Error(`Could not retrieve HTTP status code from: '${response}'`));
    } else {
      const httpStatus = Number(match![1]);

      let fileContent: string | object = '';

      /* eslint-disable no-lonely-if */
      if (httpStatus === 204 /* No Content */) {
        // Nothing to return
      } else {
        const filename = response;

        if (filename.endsWith('.json') || filename.endsWith('.js') || filename.endsWith('.ts')) {
          // Can load .json, .js or .ts files
          deleteRequireCache(filename);
          fileContent = (await import(filename)).default;
        } else {
          // Anything else: .html, .jpg...
          fileContent = fs.readFileSync(filename);
        }
      }
      /* eslint-enable no-lonely-if */

      res.status(httpStatus).send(fileContent);
    }
  }
}

export function stubServer(configPath: string, app: express.Application) {
  // Do not use asynchronous code here otherwise routes will
  // be defined after the ones from webpack-dev-server

  _configPath = configPath;

  const { routes } = getConfig();

  Object.entries(routes).forEach(([apiPath, route]) => {
    Object.entries(route).forEach(([method]) => {
      app[method as Method](apiPath, (req, res, next) =>
        processStubRequest(apiPath, req, res, next)
      );
    });
  });
}
