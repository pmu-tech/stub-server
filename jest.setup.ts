// [console.assert not throwing with v22.4.0](https://github.com/facebook/jest/issues/5634)
import assert from 'assert'; // eslint-disable-line import/newline-after-import
console.assert = assert;
