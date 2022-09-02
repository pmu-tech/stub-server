## 0.11.0 (2022/09/08)

- Breaking change: remove `headers` option: use a function with [req](http://expressjs.com/en/4x/api.html#req) as parameter instead
- Document how to configure stub-server both for stubs and as a proxy
- Bind to 0.0.0.0 address
- Improve documentation
- Rework CommonJS and ESM modules, https://github.com/rollup/rollup/wiki/pkg.module
- Update npm packages

## 0.7.0 (2022/01/21)

- Breaking change: CLI config path is now an argument instead of an option
- Breaking change: remove CLI short options
- New CLI option --no-delay
- Fix express peer dependency
- Improve documentation (JSDoc)
- Update npm packages

## 0.6.1 (2021/12/07)

- Improve internal algorithm & unit tests

## 0.6.0 (2021/11/17)

- In proxy mode:
  - rewrite cookie domain
  - fix request body
  - remove Secure from Set-Cookie header

## 0.5.0 (2021/11/16)

- Breaking change: remove lower case HTTP request methods
- Update npm packages
- Test with Node.js 16 (GitHub CI)

## 0.4.1 (2021/11/15)

- Improve documentation
- Better error handling (#31)
- Update npm packages

## 0.4.0 (2021/05/25)

- New option to customize HTTP headers
- Update npm packages

## 0.3.4 (2020/12/28)

- Update npm packages

## 0.3.3 (2020/11/15)

- Update npm packages
- Use eslint-plugin-unicorn

## 0.3.2 (2020/08/11)

- Update npm packages
- Fix ESLint rules

## 0.3.1 (2020/04/12)

- Improve documentation
- Update npm packages

## 0.3.0 (2020/03/16)

- Switch to upper case HTTP verbs (still compatible with lower case HTTP verbs)
- Update npm packages

## 0.2.1 (2020/01/29)

- Support CLI options in bin/stub-server.js thx to Commander.js

## 0.2.0 (2020/01/24)

- Replace express-http-proxy with node-http-proxy
- Enable CORS in bin/stub-server.js

## 0.1.3 (2020/01/21)

- CLI thx to bin/stub-server.js

## 0.1.2 (2020/01/21)

- First official version
