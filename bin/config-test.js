// @ts-check

/* eslint-disable @typescript-eslint/no-var-requires */

const { resolve } = require('path');

const stubsPath = resolve(__dirname, '../src/config-test');

exports.default = {
  routes: {
    '/get/json': { get: `${stubsPath}/get_200_OK.json` }
  }
};
