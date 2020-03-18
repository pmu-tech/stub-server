#!/usr/bin/env node

// @ts-check

/* eslint-disable @typescript-eslint/no-var-requires */

const cmd = require('commander');
const express = require('express');
const { resolve } = require('path');

const { stubServer } = require('../dist/cjs/stubServer');

cmd
  .option('-p, --port <port>', 'stub server port', '12345')
  .option('-c, --config <config>', 'config file', 'stubs/config');

cmd.parse(process.argv);

// https://en.wikipedia.org/wiki/ANSI_escape_code
const ESC = {
  Reset: '\x1b[0m',
  Bold: '\x1b[1m',
  Blue: '\x1b[34m'
};
/** @param {string} text */
const emphasize = text => `${ESC.Bold}${ESC.Blue}${text}${ESC.Reset}`;

const config = resolve(cmd.config);
const host = 'localhost';
const port = Number(cmd.port);

const app = express();

// CORS
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const server = app.listen(port, host, () => {
  const address = /** @type {import('net').AddressInfo} */ (server.address());
  console.log(
    `stub-server is running at ${emphasize(`http://${address.address}:${address.port}`)}`
  );
});

stubServer(config, app);
