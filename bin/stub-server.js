#!/usr/bin/env node

// @ts-check

/* eslint-disable @typescript-eslint/no-var-requires */

const { program } = require('commander');
const express = require('express');
const path = require('path');

const { stubServer } = require('../dist/cjs/stubServer');

// https://en.wikipedia.org/wiki/ANSI_escape_code
const ESC = {
  Reset: '\u001B[0m',
  Bold: '\u001B[1m',
  Blue: '\u001B[34m'
};
/** @param {string} text */
const emphasize = text => `${ESC.Bold}${ESC.Blue}${text}${ESC.Reset}`;

/**
 * @param {string} config
 * @param {{ port: string; delay: boolean; }} options
 */
function start(config, { port, delay }) {
  const app = express();

  // CORS
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });

  const server = app.listen(Number(port), '0.0.0.0', () => {
    const address = /** @type {import('net').AddressInfo} */ (server.address());
    console.info(
      `stub-server is running at ${emphasize(`http://${address.address}:${address.port}`)}`
    );
  });

  stubServer(path.resolve(config), app, { delay });
}

program
  .argument('<config>', 'path to the config file')
  .option('--port <port>', 'stub server port', '12345')
  .option('--no-delay', 'ignore any delay specified in the config', false)
  .action((config, options) => start(config, options))
  .parse();
