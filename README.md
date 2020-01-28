# @pmu-tech/stub-server

[![npm version](https://badge.fury.io/js/%40pmu-tech%2Fstub-server.svg)](https://www.npmjs.com/package/@pmu-tech/stub-server)
![Build Status](https://github.com/pmu-tech/stub-server/workflows/Node%20CI/badge.svg)
[![npm bundle size](https://img.shields.io/bundlephobia/min/%40pmu-tech/stub-server.svg)](https://bundlephobia.com/result?p=@pmu-tech/stub-server)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Airbnb Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)

Stub server for REST APIs

For each route, decide what will happen: a JSON stub, a piece of JS or redirect to a real server

- Use it with Express, [webpack-dev-server](https://github.com/webpack/webpack-dev-server) or the command line
- Support stubs written in JSON, JS, TypeScript, HTML, jpg...
- Can redirect requests to another host thx to [node-http-proxy](https://github.com/http-party/node-http-proxy)
- No need to restart stub-server if you modify a stub
- The HTTP status code returned is determined from the stub filename: \*\_200\_\*.json, \*\_500\_\*.html...
- Configurable delays to simulate slow APIs

## Usage

`npm install --save-dev @pmu-tech/stub-server`

### Proposed file organization

```
stubs/routes/my_api1_get_200_OK.json
             my_api2_get_200_OK.jpg
             my_api3_post_400_BadRequest-invalidField.ts
             my_api4_post_400_BadRequest-invalidField.js
             my_api5_delete_500_InternalServerError.html
             my_api7_get_200_OK.json
             my_api7_post_200_OK.json
             my_api7_get.ts
             my_api8_get.ts
             my_api9_get_200_OK-param1.json
             my_api9_get_200_OK-param2.json
stubs/config.ts
webpack.config.ts
```

### stubs/config.ts

```TypeScript
import { resolve } from 'path';
import { StubServerConfig } from '@pmu-tech/stub-server';

const prod = 'https://pmu.fr';

const stubsPath = resolve(__dirname, 'routes');

const config: StubServerConfig = {
  delay: { min: 500, max: 3000 },
  routes: {
    '/my/api1': { get: `${stubsPath}/my_api1_get_200_OK.json` },
    '/my/api2': { get: `${stubsPath}/my_api2_get_200_OK.jpg` },
    '/my/api3': { post: `${stubsPath}/my_api3_post_400_BadRequest-invalidField.ts` },
    '/my/api4': { post: `${stubsPath}/my_api4_post_400_BadRequest-invalidField.js` },
    '/my/api5': { delete: `${stubsPath}/my_api5_delete_500_InternalServerError.html` },
    '/my/api6/:id': { put: prod },
    '/my/api7': {
      delay: { min: 1000, max: 1000 },
      get: `${stubsPath}/my_api7_get_200_OK.json`,
      post: {
        delay: { min: 0, max: 0 },
        response: `${stubsPath}/my_api7_post_200_OK.json`
      }
    },
    '/my/api7': { get: `${stubsPath}/my_api7_get.ts`},
    '/my/api8': { get: `${stubsPath}/my_api8_get.ts`},
    '/my/api9/:id': { get: req => `${stubsPath}/my_api9_get_200_OK-${req.params.id}.json` }
  }
};

const rootApiPath = 'https://pmu.fr/client/:clientApi';
config.routes[`${rootApiPath}/my/api7`] = { get: `${stubsPath}/my_api7_get_200_OK.json` };

export default config; // Or "exports.default = config"
```

### webpack.config.ts

Configuration with [webpack-dev-server](https://github.com/webpack/webpack-dev-server)

```TypeScript
import { stubServer } from '@pmu-tech/stub-server';

// ...

  devServer: {
    // ...

    before: app => {
      const configPath = path.resolve(__dirname, 'stubs', 'config');
      stubServer(configPath, app);
    }

    // ...
  },

// ...
```

### Command line

`./node_modules/.bin/stub-server`

Runs stub-server at http://127.0.0.1:12345 using `stubs/config`

### stubs/routes/my_api3_post_400_BadRequest-invalidField.ts

```TypeScript
export default {
  errorMessage: 'Invalid field'
};
```

### stubs/routes/my_api4_post_400_BadRequest-invalidField.js

```JavaScript
module.exports = {
  errorMessage: 'Invalid field'
};
```

### stubs/routes/my_api7_get.ts

```TypeScript
import express from 'express';

export default function stub(req: express.Request, res: express.Response) {
  res.send('Hello, World!');
}
```

### stubs/routes/my_api8_get.js

```JavaScript
module.exports = (req, res) => {
  res.send('Hello, World!');
};
```

## Contributing

### Prerequisites

- Node.js >= 10
- VSCode extensions: "EditorConfig for VS Code" and "Prettier - Code formatter"

### Build

`npm run build`
