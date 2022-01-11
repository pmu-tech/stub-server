/* eslint-disable jest/no-done-callback */

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import http from 'http';

// If something goes wrong with these tests, use "killall node"

const bin = './bin/stub-server.js';
const correctConfig = 'bin/config-test';
const correctPort = '16928';

// https://en.cppreference.com/w/cpp/utility/program/EXIT_status
// @ts-ignore
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// eslint-disable-next-line unicorn/no-null
const EXIT_SIGTERM = null;

const killStubServerAfterRunning = (process: ChildProcessWithoutNullStreams) =>
  setTimeout(() => process.kill(), 300 /* Wait for stub-server to start */);

// [Remove all ANSI colors/styles from strings](https://stackoverflow.com/q/25245716)
const cleanAnsi = (str: string) =>
  // eslint-disable-next-line no-control-regex
  str.replace(/[\u001B\u009B][#();?[]*(?:\d{1,4}(?:;\d{0,4})*)?[\d<=>A-ORZcf-nqry]/g, '');

test('correct config param', done => {
  expect.assertions(2);

  const process = spawn(bin, ['--config', correctConfig]);
  process.stdout.on('data', data => {
    expect(cleanAnsi(data.toString())).toEqual(
      'stub-server is running at http://127.0.0.1:12345\n'
    );
  });
  process.stderr.on('data', data => {
    expect(data.toString()).toEqual('Never reached');
  });
  process.on('exit', code => {
    expect(code).toEqual(EXIT_SIGTERM);
    done();
  });

  killStubServerAfterRunning(process);
});

test('port option', done => {
  expect.assertions(2);

  const process = spawn(bin, ['--config', correctConfig, '--port', correctPort]);
  process.stdout.on('data', data => {
    expect(cleanAnsi(data.toString())).toEqual(
      `stub-server is running at http://127.0.0.1:${correctPort}\n`
    );
  });
  process.stderr.on('data', data => {
    expect(data.toString()).toEqual('Never reached');
  });
  process.on('exit', code => {
    expect(code).toEqual(EXIT_SIGTERM);
    done();
  });

  killStubServerAfterRunning(process);
});

test('no-delay option', done => {
  expect.assertions(2);

  const process = spawn(bin, ['--config', correctConfig, '--no-delay']);
  process.stdout.on('data', data => {
    expect(cleanAnsi(data.toString())).toEqual(
      'stub-server is running at http://127.0.0.1:12345\n'
    );
  });
  process.stderr.on('data', data => {
    expect(data.toString()).toEqual('Never reached');
  });
  process.on('exit', code => {
    expect(code).toEqual(EXIT_SIGTERM);
    done();
  });

  killStubServerAfterRunning(process);
});

test('network request', done => {
  // Unfortunately it does not test CORS because the request is performed server side :-/
  // Users perform requests in a web browser where CORS is enabled

  expect.assertions(3);

  const process = spawn(bin, ['--config', correctConfig, '--port', correctPort]);
  process.stdout.on('data', data => {
    if (data.toString().includes('stub-server is running')) {
      http.get(`http://localhost:${correctPort}/get/json`, res => {
        let resData = '';
        res.on('data', chunk => {
          resData += chunk;
        });

        res.on('close', () => {
          /* eslint-disable jest/no-conditional-expect */
          expect(res.statusCode).toEqual(200);
          expect(JSON.parse(resData)).toEqual({ stub: 'GET_200_OK.json' });
          /* eslint-enable jest/no-conditional-expect */

          process.kill();
        });
      });
    }
  });
  process.stderr.on('data', data => {
    expect(data.toString()).toEqual('Never reached');
  });
  process.on('exit', code => {
    expect(code).toEqual(EXIT_SIGTERM);
    done();
  });
});

test('incorrect config param', done => {
  expect.assertions(2);

  const process = spawn(bin, ['--config', 'notFound']);
  process.stdout.on('data', data => {
    expect(data.toString()).toEqual('Never reached');
  });
  process.stderr.on('data', data => {
    expect(data.toString()).toMatch(/Error: Cannot find module '.*notFound'/);
  });
  process.on('exit', code => {
    expect(code).toEqual(EXIT_FAILURE);
    done();
  });
});

test('incorrect port option', done => {
  expect.assertions(2);

  const process = spawn(bin, ['--config', correctConfig, '--port', '80']);
  process.stdout.on('data', data => {
    expect(data.toString()).toEqual('Never reached');
  });
  process.stderr.on('data', data => {
    expect(data.toString()).toMatch(/Error: listen EACCES: permission denied 127\.0\.0\.1:80/);
  });
  process.on('exit', code => {
    expect(code).toEqual(EXIT_FAILURE);
    done();
  });
});
