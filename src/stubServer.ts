import express from 'express';
import fs from 'fs';

import { send } from './proxy';

type HTTPVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type URL = string;
type StubFilename = string;
type GetStubFilenameFunction = (req: express.Request) => URL | StubFilename;
type Stub = URL | StubFilename | GetStubFilenameFunction;

type Delay = { min: number; max: number };

type Response = {
  [httpVerb in HTTPVerb]?: Stub | { response: Stub; delay?: Delay };
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

async function randomDelay(min: number, max: number) {
  // We could do better by allowing different number distributions
  // See [Generate random number with a non-uniform distribution](https://stackoverflow.com/q/16110758)
  // See [Generate random number between two numbers in JavaScript](https://stackoverflow.com/a/7228322/990356)
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await sleep(delay);
  return delay;
}

const isUrl = (str: string) => str.startsWith('http');

let _configPath: string;

function getConfig() {
  deleteRequireCache(_configPath);
  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(_configPath).default as StubServerConfig;
}

async function parseConfig(apiPath: string, req: express.Request) {
  // Re-read the config file for each new request so the user
  // don't have to restart the stub server
  // except if he adds a new route which is acceptable
  const { delay: globalDelay, routes } = getConfig();

  const route = routes[apiPath];

  const { delay: routeDelay, ...responses } = route;

  const httpVerb = req.method as HTTPVerb;
  const stub = responses[httpVerb]!;

  let name: URL | StubFilename;
  let delay: Delay | undefined;

  if (typeof stub === 'string') {
    name = stub;
  } else if (typeof stub === 'function') {
    name = stub(req);
  } else {
    name = typeof stub.response === 'function' ? stub.response(req) : stub.response;
    delay = stub.delay;
  }

  // Delay the request to simulate network latency
  // istanbul ignore next
  const { min, max } = delay ?? routeDelay ?? globalDelay ?? { min: 0, max: 0 };
  const actualDelay = await randomDelay(min, max);

  console.log(`${httpVerb} ${req.url} => ${name}, delay: ${actualDelay} ms`);

  return name;
}

async function processStubRequest(
  apiPath: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const stubName = await parseConfig(apiPath, req);

  if (isUrl(stubName)) {
    const url = stubName;
    send(url, req, res, next);
  } else {
    const filename = stubName;

    let fileContent: string | object | undefined;

    if (filename.endsWith('.json') || filename.endsWith('.js') || filename.endsWith('.ts')) {
      // Can load .json, .js or .ts files
      // If file does not exist: "Cannot find module '...'"
      deleteRequireCache(filename);
      const jsFileContent = (await import(filename)).default;

      if (
        (filename.endsWith('.js') || filename.endsWith('.ts')) &&
        typeof jsFileContent === 'function'
      ) {
        // Assume the function is an Express request handler
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
      const match = /_(\d+)_[a-zA-Z]+/.exec(filename);
      const httpStatus =
          match !== null ? Number(match![1]) : 200 /* Default HTTP status if none specified */;

      if (httpStatus === 204 /* No Content */) {
        res.status(httpStatus).end();
      } else {
        res.status(httpStatus).send(fileContent);
      }
    }
  }
}

type ExpressRoute = 'get' | 'post' | 'put' | 'patch' | 'delete';

export function stubServer(configPath: string, app: express.Application) {
  // Do not use asynchronous code here otherwise routes will
  // be defined after the ones from webpack-dev-server

  _configPath = configPath;

  const { routes } = getConfig();

  Object.entries(routes).forEach(([apiPath, route]) => {
    Object.keys(route).forEach(httpVerb => {
      if (httpVerb !== 'delay') {
        // If invalid HTTP verb, crash with "TypeError: app[httpVerb] is not a function"
        app[httpVerb.toLowerCase() as ExpressRoute](apiPath, (req, res, next) =>
          processStubRequest(apiPath, req, res, next)
        );
      }
    });
  });
}
