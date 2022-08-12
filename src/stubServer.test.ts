import express from 'express';
import path from 'path';
import request from 'supertest';

import * as proxy from './proxy';
import { stubServer } from './stubServer';

const configPath = path.resolve(__dirname, 'config-test/config');
const app = express();
stubServer(configPath, app);

let consoleSpy: jest.SpyInstance;
beforeEach(() => {
  consoleSpy = jest.spyOn(console, 'info').mockImplementation();
});
afterEach(() => consoleSpy.mockRestore());

describe('files', () => {
  test('file without HTTP status', async () => {
    const res = await request(app).get('/get/json/noHttpStatus');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'GET_noHttpStatus.json' });
  });

  test('json file does not exist', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const res = await request(app).get('/get/json/noFile');
    expect(res.status).toEqual(500);
    expect(res.body).toEqual({});
    expect(res.text).toContain('Error: Cannot find module');
    expect(res.text).toContain('GET_200_OK-noFile.json');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });

  test('png file does not exist', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const res = await request(app).get('/get/png/noFile');
    expect(res.status).toEqual(500);
    expect(res.body).toEqual({});
    expect(res.text).toContain('Error: ENOENT: no such file or directory');
    expect(res.text).toContain('GET_200_OK-noFile.png');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });

  test('json', async () => {
    const res = await request(app).get('/get/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'GET_200_OK.json' });
  });

  test('png', async () => {
    const res = await request(app).get('/get/png');
    expect(res.status).toEqual(200);

    // Image taken from https://github.com/aureooms/pixels/tree/2c1e39152339aa8323304d037aeeed1f9e6e24ab

    expect(res.body).toEqual(expect.any(Buffer));
  });

  test('ts', async () => {
    const res = await request(app).get('/get/ts');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'GET_200_OK.ts' });
  });

  test('js', async () => {
    const res = await request(app).get('/get/js');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'GET_200_OK.js' });
  });

  test('html', async () => {
    const res = await request(app).get('/get/html');
    expect(res.status).toEqual(200);
    const html = (res.body as Buffer).toString();
    expect(html).toEqual('<!DOCTYPE html>\n<title>GET_200_OK.html</title>\n');
  });

  test('JavaScript inside .json file', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const res = await request(app).get('/get/js-with-json-file-extension');
    expect(res.status).toEqual(500);
    expect(res.body).toEqual({});
    expect(res.text).toContain('SyntaxError: Unexpected token m in JSON at position 0');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected token m in JSON at position 0');
    consoleErrorSpy.mockRestore();
  });
});

describe('HTTP status codes', () => {
  test('invalid HTTP status code', async () => {
    const res = await request(app).get('/get/666_invalidHttpStatus');
    expect(res.status).toEqual(666);
    expect(res.body).toEqual({ stub: 'GET_666_invalidHttpStatus.json' });
  });

  test('400 Bad Request', async () => {
    const res = await request(app).get('/get/400_BadRequest');
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ stub: 'GET_400_BadRequest.json' });
  });

  test('500 Internal Server Error', async () => {
    const res = await request(app).get('/get/500_InternalServerError');
    expect(res.status).toEqual(500);
    expect(res.body).toEqual({ stub: 'GET_500_InternalServerError.json' });
  });

  describe('204 No Content', () => {
    test('empty .txt file', async () => {
      const res = await request(app).get('/get/204_NoContent-empty-txt');
      expect(res.status).toEqual(204);
      expect(res.body).toEqual({});
      expect(res.text).toEqual('');
    });

    test('filled .json file', async () => {
      const res = await request(app).get('/get/204_NoContent-filled-json');
      expect(res.status).toEqual(204);
      expect(res.body).toEqual({});
      expect(res.text).toEqual('');
    });

    test('empty .json file should not crash', async () => {
      const res = await request(app).get('/get/204_NoContent-empty-json');
      expect(res.status).toEqual(204);
      expect(res.body).toEqual({});
      expect(res.text).toEqual('');
    });
  });
});

describe('HTTP request methods', () => {
  // eslint-disable-next-line jest/expect-expect
  test('invalid HTTP request method', async () => {
    // If config.ts contains an invalid HTTP request method,
    // stubServer.ts throws "Invalid HTTP request method: 'foobar'"
  });

  test('HEAD not supported', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const res = await request(app).head('/get/json');
    expect(res.status).toEqual(500);
    // request(app).head() won't return the body (which is expected)
    expect(res.body).toEqual({});
    expect(res.text).toEqual(undefined);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("No route for 'HEAD' HTTP request method");
    consoleErrorSpy.mockRestore();
  });

  test('GET', async () => {
    const res = await request(app).get('/get/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'GET_200_OK.json' });
  });

  test('POST', async () => {
    const res = await request(app).post('/post/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'POST_200_OK.json' });
  });

  test('PUT', async () => {
    const res = await request(app).put('/put/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'PUT_200_OK.json' });
  });

  test('PATCH', async () => {
    const res = await request(app).patch('/patch/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'PATCH_200_OK.json' });
  });

  test('DELETE', async () => {
    const res = await request(app).delete('/delete/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'DELETE_200_OK.json' });
  });

  test('multiple HTTP request methods', async () => {
    let res = await request(app).get('/multiple/methods');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'GET_200_OK.json' });

    res = await request(app).post('/multiple/methods');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'POST_200_OK.json' });

    res = await request(app).put('/multiple/methods');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'PUT_200_OK.json' });

    res = await request(app).patch('/multiple/methods');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'PATCH_200_OK.json' });

    res = await request(app).delete('/multiple/methods');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'DELETE_200_OK.json' });
  });
});

describe('proxy', () => {
  const GET_jsonplaceholder_typicode_com_posts_1 = {
    userId: 1,
    id: 1,
    title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
  };

  const POST_postman_echo_com_post = {
    args: {},
    data: {},
    files: {
      '1x1#000000.png':
        'data:application/octet-stream;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACXBIWXMAAAsTAAALEwEAmpwYAAAACklEQVQIHWNgAAAAAgABz8g15QAAAABJRU5ErkJggg=='
    },
    form: {},
    headers: {
      'accept-encoding': 'gzip, deflate',
      'content-length': '300',
      'content-type':
        'multipart/form-data; boundary=--------------------------579117600727930638952591',
      host: 'postman-echo.com',
      'x-amzn-trace-id': 'Root=1-5f1b1e55-f46447b2ed92d3ab58eabb7b',
      'x-forwarded-port': '443',
      'x-forwarded-proto': 'https'
    },
    // eslint-disable-next-line unicorn/no-null
    json: null,
    url: 'https://postman-echo.com/post'
  };

  describe('mocked, no network request', () => {
    test('URL redirection with param', async () => {
      const sendToProxyMock = jest
        .spyOn(proxy, 'send')
        .mockImplementation(
          (
            _target: string,
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction
          ) => res.status(200).send(GET_jsonplaceholder_typicode_com_posts_1)
        );

      const res = await request(app).get('/posts/1');
      expect(sendToProxyMock).toHaveBeenCalledTimes(1);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(GET_jsonplaceholder_typicode_com_posts_1);

      sendToProxyMock.mockRestore();
    });

    test('URL redirection to unknown host', async () => {
      const sendToProxyMock = jest
        .spyOn(proxy, 'send')
        .mockImplementation(
          (
            _target: string,
            _req: express.Request,
            _res: express.Response,
            next: express.NextFunction
          ) => {
            const error = new Error(
              'getaddrinfo ENOTFOUND unknown_host.com unknown_host.com:80'
            ) as any;
            error.errno = 'ENOTFOUND';
            error.code = 'ENOTFOUND';
            error.syscall = 'getaddrinfo';
            error.hostname = 'unknown_host.com';
            error.host = 'unknown_host.com';
            error.port = 80;
            next(error);
          }
        );

      const res = await request(app).get('/unknownHost');
      expect(sendToProxyMock).toHaveBeenCalledTimes(1);
      expect(res.status).toEqual(500);
      expect(res.serverError).toEqual(true);
      expect(res.text).toMatch(/<title>Error<\/title>/);
      expect(res.text).toMatch(/<pre>Error: getaddrinfo ENOTFOUND unknown_host\.com.*<\/pre>/);

      sendToProxyMock.mockRestore();
    });

    test('POST multipart request', async () => {
      const sendToProxyMock = jest
        .spyOn(proxy, 'send')
        .mockImplementation(
          (
            _target: string,
            _req: express.Request,
            res: express.Response,
            _next: express.NextFunction
          ) => res.status(200).send(POST_postman_echo_com_post)
        );

      // Image taken from https://github.com/aureooms/pixels/tree/2c1e39152339aa8323304d037aeeed1f9e6e24ab

      const res = await request(app)
        .post('/post')
        .attach('image', `${__dirname}/config-test/1x1#000000.png`);
      expect(sendToProxyMock).toHaveBeenCalledTimes(1);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(POST_postman_echo_com_post);

      sendToProxyMock.mockRestore();
    });
  });

  describe('not mocked, performs real network requests, might fail', () => {
    test('URL redirection with param', async () => {
      const res = await request(app).get('/posts/1');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(GET_jsonplaceholder_typicode_com_posts_1);
    });

    test('URL redirection to unknown host', async () => {
      const res = await request(app).get('/unknownHost');
      expect(res.status).toEqual(500);
      expect(res.serverError).toEqual(true);
      expect(res.text).toMatch(/<title>Error<\/title>/);
      expect(res.text).toMatch(/<pre>Error: getaddrinfo ENOTFOUND unknown_host\.com.*<\/pre>/);
    });

    test('POST multipart request', async () => {
      // Image taken from https://github.com/aureooms/pixels/tree/2c1e39152339aa8323304d037aeeed1f9e6e24ab

      const response = JSON.parse(JSON.stringify(POST_postman_echo_com_post)); // Deep copy
      response.headers['content-type'] = expect.any(String);
      response.headers['x-amzn-trace-id'] = expect.any(String);

      const res = await request(app)
        .post('/post')
        .attach('image', `${__dirname}/config-test/1x1#000000.png`);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(response);
    });
  });
});

test('delay', async () => {
  let res = await request(app).get('/multiple/methods/delay');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ stub: 'GET_200_OK.json' });
  expect(consoleSpy).toHaveBeenCalledTimes(1);
  expect(consoleSpy).toHaveBeenLastCalledWith(
    expect.stringMatching(
      /^GET \/multiple\/methods\/delay => \/.*\/config-test\/GET_200_OK\.json, delay: (2|3) ms$/
    )
  );

  res = await request(app).post('/multiple/methods/delay');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ stub: 'POST_200_OK.json' });
  expect(consoleSpy).toHaveBeenCalledTimes(2);
  expect(consoleSpy).toHaveBeenLastCalledWith(
    expect.stringMatching(
      /^POST \/multiple\/methods\/delay => \/.*\/config-test\/POST_200_OK\.json, delay: (4|5) ms$/
    )
  );

  res = await request(app).put('/multiple/methods/delay');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ stub: 'PUT_200_OK.json' });
  expect(consoleSpy).toHaveBeenCalledTimes(3);
  expect(consoleSpy).toHaveBeenLastCalledWith(
    expect.stringMatching(
      /^PUT \/multiple\/methods\/delay => \/.*\/config-test\/PUT_200_OK\.json, delay: ([4-6]) ms$/
    )
  );
});

test('HTTP headers', async () => {
  let res = await request(app).get('/root/headers');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({
    headers: {
      'accept-encoding': 'gzip, deflate',
      connection: 'close',
      host: expect.any(String)
    }
  });

  res = await request(app).get('/multiple/methods/headers');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({
    headers: {
      'accept-encoding': 'gzip, deflate',
      connection: 'close',
      host: expect.any(String),
      origin: 'http://routeHeaders.com'
    }
  });

  res = await request(app).post('/multiple/methods/headers');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({
    headers: {
      'accept-encoding': 'gzip, deflate',
      connection: 'close',
      'content-length': '0',
      host: expect.any(String),
      origin: 'http://POST.com'
    }
  });

  res = await request(app).put('/multiple/methods/headers');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({
    headers: {
      'accept-encoding': 'gzip, deflate',
      connection: 'close',
      'content-length': '0',
      host: expect.any(String),
      origin: 'http://PUT.com'
    }
  });
});

test('unknown route', async () => {
  const res = await request(app).get('/get/unknownRoute');
  expect(res.status).toEqual(404);
  expect(res.body).toEqual({});
  expect(res.text).toMatch(/<title>Error<\/title>/);
  expect(res.text).toMatch(/<pre>Cannot GET \/get\/unknownRoute<\/pre>/);
});

describe('Express handler function', () => {
  describe('ts', () => {
    test('res.send()', async () => {
      const res = await request(app).get('/get/express-handler/ts/send');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ param: 'send' });
    });

    test('res.send() async', async () => {
      const res = await request(app).get('/get/express-handler/ts/sendAsync');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ param: 'sendAsync' });
    });

    // eslint-disable-next-line jest/expect-expect
    test('res.status()', async () => {
      // Timeout because the stub does not send a response
      // await request(app).get('/get/express-handler/ts/status');
    });

    test('res.end()', async () => {
      const res = await request(app).get('/get/express-handler/ts/end');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({});
      expect(res.text).toEqual('');
    });

    // eslint-disable-next-line jest/expect-expect
    test('do nothing', async () => {
      // Timeout because the stub does not send a response
      // await request(app).get('/get/express-handler/ts/doNothing');
    });

    test('without param', async () => {
      const res = await request(app).get('/get/express-handler/ts');
      expect(res.status).toEqual(204);
      expect(res.body).toEqual({});
      expect(res.text).toEqual('');
    });
  });

  test('js', async () => {
    const res = await request(app).get('/get/express-handler/js/param');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ param: 'param' });
  });
});

describe('get stub name from function', () => {
  test('no response property', async () => {
    const res = await request(app).get('/function/param');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'GET_function_200_OK-param.json' });
  });

  test('with response property', async () => {
    const res = await request(app).post('/function/param');
    expect(res.status).toEqual(201);
    expect(res.body).toEqual({ stub: 'POST_function_201_Created-param.json' });
  });
});
