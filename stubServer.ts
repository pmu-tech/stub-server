import express from 'express';
import fs from 'fs';
import proxy from 'express-http-proxy';

type HTTPVerb = 'get' | 'post' | 'put' | 'patch' | 'delete';
type URL = string;
type StubFilename = string;

type Delay = { min: number; max: number };

type Response = {
  [httpVerb in HTTPVerb]?: URL | StubFilename | { response: URL | StubFilename; delay?: Delay };
};

type Route = { delay?: Delay } & Response;

export interface StubServerConfig {
  delay?: Delay;
  routes: {
    [apiPath: string]: Route;
  };
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
  // See [Generate random number between two numbers in JavaScript](https://stackoverflow.com/a/7228322/990356)
  sleep(Math.floor(Math.random() * (max - min + 1)) + min);

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

function sendToProxy(
  host: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  proxy(host, { parseReqBody: !isMultipartRequest(req) })(req, res, next);
}

async function parseConfig(apiPath: string, req: express.Request) {
  // Re-read the config file for each new request so the user
  // don't have to restart the stub server
  // except if he adds a new route which is acceptable
  const { delay: globalDelay, routes } = getConfig();

  const route = routes[apiPath];

  const { delay: routeDelay, ...responses } = route;

  const httpVerb = req.method.toLowerCase() as HTTPVerb;
  const findResponse = responses[httpVerb]!;

  let response: URL | StubFilename;
  let delay: Delay | undefined;

  if (typeof findResponse === 'string') {
    response = findResponse;
  } else {
    response = findResponse.response;
    delay = findResponse.delay;
  }

  // Delay the request to simulate network latency
  // istanbul ignore next
  const { min, max } = delay ?? routeDelay ?? globalDelay ?? { min: 0, max: 0 };
  await randomDelay(min, max);

  console.log(`${httpVerb} ${req.url} => ${response}, delay: ${min}..${max} ms`);

  return response;
}

async function processStubRequest(
  apiPath: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const response = await parseConfig(apiPath, req);

  if (isUrl(response)) {
    const url = `${response}${req.url}`;
    sendToProxy(url, req, res, next);
  } else {
    const filename = response;

    const match = /_(\d+)_[a-zA-Z]+/.exec(filename);

    if (match === null) {
      next(new Error(`Could not retrieve HTTP status code from: '${filename}'`));
    } else {
      const httpStatus = Number(match![1]);

      let fileContent: string | object = '';

      if (httpStatus === 204 /* No Content */) {
        // Nothing to return
      } else if (
        filename.endsWith('.json') ||
        filename.endsWith('.js') ||
        filename.endsWith('.ts')
      ) {
        // Can load .json, .js or .ts files
        // If file does not exist: "Cannot find module '...'"
        deleteRequireCache(filename);
        fileContent = (await import(filename)).default;
      } else {
        // Anything else: .html, .jpg...
        // If file does not exist: "ENOENT: no such file or directory, open '...'"
        fileContent = fs.readFileSync(filename);
      }

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
    Object.keys(route).forEach(httpVerb => {
      if (httpVerb !== 'delay') {
        // If invalid HTTP verb, crash with "TypeError: app[httpVerb] is not a function"
        app[httpVerb as HTTPVerb](apiPath, (req, res, next) =>
          processStubRequest(apiPath, req, res, next)
        );
      }
    });
  });
}
