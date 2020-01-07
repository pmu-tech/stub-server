// @ts-check

/* eslint-disable @typescript-eslint/no-var-requires */
const { defaults } = require('jest-config');
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = {
  setupFiles: ['./jest.setup.ts'],
  coveragePathIgnorePatterns: [...defaults.coveragePathIgnorePatterns, './jest.setup.ts'],

  // By default Jest allows for __tests__/*.js, *.spec.js and *.test.js
  // See https://jestjs.io/docs/en/configuration#testregex-string-array-string
  // let's be strict and use *.test.js only
  testRegex: '\\.test\\.tsx?$'
};
