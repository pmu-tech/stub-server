import path from 'path';
import request from 'supertest';
import express from 'express';
import proxy from 'express-http-proxy';

import { stubServer } from './stubServer';

jest.mock('express-http-proxy');

const configPath = path.resolve(__dirname, 'config-test', 'config');

let app: express.Express;

beforeAll(() => {
  app = express();
  stubServer(configPath, app);
});

describe('files', () => {
  test('file without HTTP status', async () => {
    const res = await request(app).get('/get/json/noHttpStatus');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'get_noHttpStatus.json' });
  });

  test('json file does not exist', async () => {
    // Crash with "Cannot find module 'stub-server/config-test/get_200_OK_noFile.json' from 'stubServer.ts'"
    // await request(app).get('/get/json/noFile');
  });

  test('png file does not exist', async () => {
    // Crash with "ENOENT: no such file or directory, open 'stub-server/config-test/get_200_OK_noFile.png'"
    // await request(app).get('/get/png/noFile');
  });

  test('json', async () => {
    const res = await request(app).get('/get/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'get_200_OK.json' });
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
    expect(res.body).toEqual({ stub: 'get_ts_200_OK.ts' });
  });

  test('js', async () => {
    const res = await request(app).get('/get/js');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'get_js_200_OK.js' });
  });

  test('html', async () => {
    const res = await request(app).get('/get/html');
    expect(res.status).toEqual(200);
    const html = (res.body as Buffer).toString();
    expect(html).toEqual('<!DOCTYPE html>\n<title>get_html_200_OK.html</title>\n');
  });
});

describe('HTTP status codes', () => {
  test('invalid HTTP status code', async () => {
    const res = await request(app).get('/get/666_invalidHttpStatus');
    expect(res.status).toEqual(666);
    expect(res.body).toEqual({ stub: 'get_666_invalidHttpStatus.json' });
  });

  test('400 Bad Request', async () => {
    const res = await request(app).get('/get/400_BadRequest');
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ stub: 'get_400_BadRequest.json' });
  });

  test('500 Internal Server Error', async () => {
    const res = await request(app).get('/get/500_InternalServerError');
    expect(res.status).toEqual(500);
    expect(res.body).toEqual({ stub: 'get_500_InternalServerError.json' });
  });

  test('204 No Content', async () => {
    const res = await request(app).get('/get/204_NoContent');
    expect(res.status).toEqual(204);
    expect(res.body).toEqual({});
    expect(res.text).toEqual('');
  });
});

describe('HTTP verbs', () => {
  test('unknown HTTP verb', () => {
    // If config.ts contains an invalid HTTP verb, then stubServer.ts crashes with:
    // TypeError: app[method] is not a function
  });

  test('GET', async () => {
    const res = await request(app).get('/get/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'get_200_OK.json' });
  });

  test('POST', async () => {
    const res = await request(app).post('/post/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'post_200_OK.json' });
  });

  test('PUT', async () => {
    const res = await request(app).put('/put/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'put_200_OK.json' });
  });

  test('PATCH', async () => {
    const res = await request(app).patch('/patch/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'patch_200_OK.json' });
  });

  test('DELETE', async () => {
    const res = await request(app).delete('/delete/json');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'delete_200_OK.json' });
  });

  test('multiple verbs', async () => {
    let res = await request(app).get('/multiple/verbs');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'get_200_OK.json' });

    res = await request(app).post('/multiple/verbs');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'post_200_OK.json' });

    res = await request(app).put('/multiple/verbs');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'put_200_OK.json' });

    res = await request(app).patch('/multiple/verbs');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'patch_200_OK.json' });

    res = await request(app).delete('/multiple/verbs');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ stub: 'delete_200_OK.json' });
  });
});

describe('proxy', () => {
  test('URL redirection with param', async () => {
    function handleProxy(
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) {
      res.status(200).send({
        userId: 1,
        id: 1,
        title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
        body:
          'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
      });
    }
    (proxy as jest.Mock).mockImplementation(() => handleProxy);

    const res = await request(app).get('/posts/1');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
      userId: 1,
      id: 1,
      title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      body:
        'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
    });
  });

  test('URL redirection to unknown host', async () => {
    function handleProxy(
      _req: express.Request,
      _res: express.Response,
      next: express.NextFunction
    ) {
      const error = new Error('getaddrinfo ENOTFOUND unknown_host.com unknown_host.com:80') as any;
      error.errno = 'ENOTFOUND';
      error.code = 'ENOTFOUND';
      error.syscall = 'getaddrinfo';
      error.hostname = 'unknown_host.com';
      error.host = 'unknown_host.com';
      error.port = 80;
      next(error);
    }
    (proxy as jest.Mock).mockImplementation(() => handleProxy);

    const res = await request(app).get('/unknownHost');
    expect(res.status).toEqual(500);
    expect(res.serverError).toEqual(true);
    expect(res.text).toMatch(/<title>Error<\/title>/);
    expect(res.text).toMatch(/<pre>Error: getaddrinfo ENOTFOUND unknown_host\.com.*<\/pre>/);
  });

  test('POST multipart request', async () => {
    function handleProxy(
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) {
      res.status(200).send({
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
          'user-agent': 'node-superagent/3.8.3',
          'x-forwarded-port': '443',
          'x-forwarded-proto': 'https'
        },
        json: null,
        url: 'https://postman-echo.com/post'
      });
    }
    (proxy as jest.Mock).mockImplementation(() => handleProxy);

    // Image taken from https://github.com/aureooms/pixels/tree/2c1e39152339aa8323304d037aeeed1f9e6e24ab

    const res = await request(app)
      .post('/post')
      .attach('image', `${__dirname}/config-test/1x1#000000.png`);
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({
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
        'content-type': expect.any(String),
        host: 'postman-echo.com',
        'user-agent': 'node-superagent/3.8.3',
        'x-forwarded-port': '443',
        'x-forwarded-proto': 'https'
      },
      json: null,
      url: 'https://postman-echo.com/post'
    });
  });
});

test('delay', async () => {
  const consoleSpy = jest.spyOn(console, 'log');

  let res = await request(app).get('/multiple/verbs/delay');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ stub: 'get_200_OK.json' });
  expect(consoleSpy).toHaveBeenCalledTimes(1);
  expect(consoleSpy).toHaveBeenLastCalledWith(
    expect.stringMatching(
      /^get \/multiple\/verbs\/delay => \/.*\/config-test\/get_200_OK\.json, delay: 2\.\.3 ms$/
    )
  );

  res = await request(app).post('/multiple/verbs/delay');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ stub: 'post_200_OK.json' });
  expect(consoleSpy).toHaveBeenCalledTimes(2);
  expect(consoleSpy).toHaveBeenLastCalledWith(
    expect.stringMatching(
      /^post \/multiple\/verbs\/delay => \/.*\/stub-server\/config-test\/post_200_OK\.json, delay: 4\.\.5 ms$/
    )
  );

  res = await request(app).put('/multiple/verbs/delay');
  expect(res.status).toEqual(200);
  expect(res.body).toEqual({ stub: 'put_200_OK.json' });
  expect(consoleSpy).toHaveBeenCalledTimes(3);
  expect(consoleSpy).toHaveBeenLastCalledWith(
    expect.stringMatching(
      /^put \/multiple\/verbs\/delay => \/.*\/stub-server\/config-test\/put_200_OK\.json, delay: 4\.\.6 ms$/
    )
  );

  consoleSpy.mockRestore();
});

test('unknown route', async () => {
  const res = await request(app).get('/get/unknownRoute');
  expect(res.status).toEqual(404);
  expect(res.body).toEqual({});
  expect(res.text).toMatch(/<title>Error<\/title>/);
  expect(res.text).toMatch(/<pre>Cannot GET \/get\/unknownRoute<\/pre>/);
});

describe('express request handler', () => {
  describe('ts', () => {
    test('res.send()', async () => {
      const res = await request(app).get('/get/express/ts/send');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ param: 'send' });
    });

    test('res.send() async', async () => {
      const res = await request(app).get('/get/express/ts/sendAsync');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({ param: 'sendAsync' });
    });

    test('res.status()', async () => {
      // Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Timeout
      // await request(app).get('/get/express/ts/status');
    });

    test('res.end()', async () => {
      const res = await request(app).get('/get/express/ts/end');
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({});
      expect(res.text).toEqual('');
    });

    test('do nothing"', async () => {
      // Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.Timeout
      // await request(app).get('/get/express/ts/doNothing');
    });

    test('without param', async () => {
      const res = await request(app).get('/get/express/ts');
      expect(res.status).toEqual(204);
      expect(res.body).toEqual({});
      expect(res.text).toEqual('');
    });
  });

  test('js', async () => {
    const res = await request(app).get('/get/express/js/param');
    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ param: 'param' });
  });
});
