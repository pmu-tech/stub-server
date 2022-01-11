#!/usr/bin/env node

// @ts-check

/* eslint-disable @typescript-eslint/no-var-requires */

const { program } = require('commander');
const express = require('express');
const path = require('path');

const { stubServer } = require('../dist/cjs/stubServer');

program
  .option('--port <port>', 'stub server port', '12345')
  .option('--config <config>', 'config file', 'stubs/config')
  .option('--no-delay', 'ignore any delay specified in the config', false)
  .parse();

// https://en.wikipedia.org/wiki/ANSI_escape_code
const ESC = {
  Reset: '\u001B[0m',
  Bold: '\u001B[1m',
  Blue: '\u001B[34m'
};
/** @param {string} text */
const emphasize = text => `${ESC.Bold}${ESC.Blue}${text}${ESC.Reset}`;

const options = program.opts();
const config = path.resolve(options.config);
const host = 'localhost';
const port = Number(options.port);

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

stubServer(config, app, { delay: options.delay });
