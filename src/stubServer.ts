import express from 'express';
import fs from 'fs';
import { IncomingHttpHeaders } from 'http';

import { send } from './proxy';

// https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type URL = string;
type StubFilename = string;
type GetStubFilenameFunction = (req: express.Request) => URL | StubFilename;
type Stub = URL | StubFilename | GetStubFilenameFunction;

type Delay = { min: number; max: number };

type CommonConfig = { delay?: Delay; headers?: IncomingHttpHeaders };

type Response = {
  [requestMethod in RequestMethod]?: Stub | (CommonConfig & { response: Stub });
};

type Route = CommonConfig & Response;

export type StubServerConfig = CommonConfig & {
  routes: {
    [apiPath: string]: Route;
  };
};

// Allows to modify the imported files without restarting the server
// [node.js require() cache - possible to invalidate?](https://stackoverflow.com/a/16060619)
function deleteRequireCache(module: string) {
  delete require.cache[require.resolve(module)];
}

function wait(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}

async function randomDelay(min: number, max: number) {
  // We could do better by allowing different number distributions
  // [Generate random number with a non-uniform distribution](https://stackoverflow.com/q/16110758)
  // [Generate random number between two numbers in JavaScript](https://stackoverflow.com/a/7228322)
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await wait(delay);
  return delay;
}

const isUrl = (str: string) => str.startsWith('http');

let _configPath: string;

function getConfig() {
  deleteRequireCache(_configPath);
  // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
  return require(_configPath).default as StubServerConfig;
}

async function parseConfig(apiPath: string, req: express.Request) {
  // Re-read the config file for each new request so the user
  // don't have to restart the stub server
  // except if he adds a new route which is acceptable
  const { delay: globalDelay, routes, headers: globalHeaders } = getConfig();

  const route = routes[apiPath];

  const { delay: routeDelay, headers: routeHeaders, ...responses } = route;

  req.headers = { ...req.headers, ...globalHeaders, ...routeHeaders };

  const requestMethod = req.method as RequestMethod;
  const stub = responses[requestMethod];

  if (stub === undefined) {
    throw new Error(`No route for '${requestMethod}' HTTP request method`);
  }

  let name: URL | StubFilename;
  let delay: Delay | undefined;

  if (typeof stub === 'string') {
    name = stub;
  } else if (typeof stub === 'function') {
    name = stub(req);
  } else {
    name = typeof stub.response === 'function' ? stub.response(req) : stub.response;
    delay = stub.delay;
    req.headers = { ...req.headers, ...stub.headers };
  }

  // Delay the request to simulate network latency
  // istanbul ignore next
  const { min, max } = delay ?? routeDelay ?? globalDelay ?? { min: 0, max: 0 };
  const actualDelay = await randomDelay(min, max);

  console.log(`${requestMethod} ${req.url} => ${name}, delay: ${actualDelay} ms`);

  return name;
}

type ExpressHandlerFunction = (req: express.Request, res: express.Response) => void;

async function processStubRequest(
  apiPath: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const stubName = await parseConfig(apiPath, req);

    if (isUrl(stubName)) {
      const url = stubName;
      send(url, req, res, next);
    } else {
      const filename = stubName;

      const match = /_(\d+)_[A-Za-z]+/.exec(filename);
      const httpStatus = match !== null ? Number(match![1]) : 200; // 200: default HTTP status if none specified

      if (httpStatus === 204 /* No Content */) {
        res.status(httpStatus).end();
      } else {
        let fileContent: ExpressHandlerFunction | object | Buffer | undefined;

        if (filename.endsWith('.json') || filename.endsWith('.js') || filename.endsWith('.ts')) {
          // If file does not exist: "Cannot find module '...'"
          deleteRequireCache(filename);
          const jsFileContent = (await import(filename)).default as object | ExpressHandlerFunction;

          if (typeof jsFileContent === 'function') {
            jsFileContent(req, res);
          } else {
            fileContent = jsFileContent;
          }
        } else {
          // Anything else: .html, .jpg...
          // If file does not exist: "ENOENT: no such file or directory, open '...'"
          fileContent = fs.readFileSync(filename);
        }

        if (fileContent !== undefined) {
          res.status(httpStatus).send(fileContent as object | Buffer);
        }
      }
    }
  } catch (e) {
    console.error((e as Error).message);
    // ["Starting with Express 5, route handlers and middleware that return
    //  a Promise will call next(value) automatically when they reject
    //  or throw an error"](http://expressjs.com/en/guide/error-handling.html#catching-errors)
    //
    // Express 5 will probably never be released :-/
    next(e);
  }
}

// https://expressjs.com/en/4x/api.html#router.METHOD
type ExpressMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

export function stubServer(configPath: string, app: express.Application) {
  // Do not use asynchronous code here otherwise routes will
  // be defined after the ones from webpack-dev-server

  _configPath = configPath;

  const { routes } = getConfig();

  Object.entries(routes).forEach(([apiPath, route]) => {
    Object.keys(route).forEach(requestMethod => {
      if (requestMethod !== 'delay' && requestMethod !== 'headers') {
        const method = requestMethod.toLowerCase() as ExpressMethod;

        // istanbul ignore next
        if (app[method] === undefined) {
          throw new Error(`Invalid HTTP request method: '${method}'`);
        }

        app[method](apiPath, (req, res, next) => processStubRequest(apiPath, req, res, next));
      }
    });
  });
}
