# Stub server

Stub server for REST APIs

For each route, decide what will happen: a json stub, a piece of JS or use a real server

- Use it with [webpack-dev-server](https://github.com/webpack/webpack-dev-server)
- Support stubs written in JSON, JS, TypeScript, HTML, jpg...
- Can redirect requests to another host thx to [express-http-proxy](https://github.com/villadora/express-http-proxy)
- No need to restart the stub server if you have modified a stub
- The HTTP status code returned is determined from the stub filename: \*\_200\_\*.json, \*\_500\_\*.html...
- Configurable delays to simulate slow APIs

## Usage

`npm install --save-dev @pmu-tech/stub-server`

### Proposed file organization

```
stubs/routes/my_api1_200_OK.json
             my_api2_200_OK.jpg
             my_api3_400_BadRequest_invalidField.ts
             my_api4_400_BadRequest_invalidField.js
             my_api5_500_InternalServerError.html
stubs/config.ts
webpack.config.ts
```

### stubs/config.ts

```TypeScript
import path from 'path';
import { StubServerConfig } from '@pmu/stub-server';

const prod = 'https://pmu.fr';

const stubsPath = path.resolve(__dirname, 'routes');

const config: StubServerConfig = {
  delay: { min: 500, max: 3000 },
  routes: {
    '/my/api1': { get: `${stubsPath}/get_my_api1_200_OK.json` },
    '/my/api2': { get: `${stubsPath}/get_my_api2_200_OK.jpg` },
    '/my/api3': { post: `${stubsPath}/post_my_api3_400_BadRequest-invalidField.ts` },
    '/my/api4': { post: `${stubsPath}/post_my_api4_400_BadRequest-invalidField.js` },
    '/my/api5': { delete: `${stubsPath}/delete_my_api5_500_InternalServerError.html` },
    '/my/api6/:id': { put: prod },
    '/my/api7': {
      delay: { min: 1000, max: 1000 },
      get: `${stubsPath}/get_my_api7_200_OK.json`,
      post: {
        delay: { min: 0, max: 0 },
        response: `${stubsPath}/post_my_api7_200_OK.json`
      }
    },
    '/my/api7': { get: `${stubsPath}/my_api7.ts`},
    '/my/api8': { get: `${stubsPath}/my_api8.ts`},
    '/my/api9/:id': { get: req => `${stubsPath}/my_api9_200_OK-${req.params.id}.json` }
  }
};

const rootApiPath = 'https://pmu.fr/client/:clientApi';
config.routes[`${rootApiPath}/my/api7`] = { get: `${stubsPath}/my_api7_200_OK.json` };

export default config; // Or "exports.default = config"
```

### webpack.config.ts

Configuration with [webpack-dev-server](https://github.com/webpack/webpack-dev-server)

```TypeScript
import { stubServer } from '@pmu/stub-server';

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

### stubs/routes/post_my_api3_400_BadRequest-invalidField.ts

```TypeScript
export default {
  errorMessage: 'Invalid field'
};
```

### stubs/routes/post_my_api4_400_BadRequest-invalidField.js

```JavaScript
module.exports = {
  errorMessage: 'Invalid field'
};
```

### stubs/routes/my_api7.ts

```TypeScript
import express from 'express';

export default function stub(req: express.Request, res: express.Response) {
  res.send('Hello, World!');
}
```

### stubs/routes/my_api8.js

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
