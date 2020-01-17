import { StubServerConfig } from '../stubServer';

const stubsPath = __dirname;

const config: StubServerConfig = {
  delay: { min: 0, max: 1 },
  routes: {
    '/get/json/noHttpStatus': { get: `${stubsPath}/get_noHttpStatus.json` },

    '/get/json/noFile': { get: `${stubsPath}/get_200_OK_noFile.json` },
    '/get/png/noFile': { get: `${stubsPath}/get_200_OK_noFile.png` },

    '/get/json': { get: `${stubsPath}/get_200_OK.json` },

    '/get/png': { get: `${stubsPath}/get_200_OK.png` },
    '/get/ts': { get: `${stubsPath}/get_200_OK.ts` },
    '/get/js': { get: `${stubsPath}/get_200_OK.js` },
    '/get/html': { get: `${stubsPath}/get_200_OK.html` },

    '/get/666_invalidHttpStatus': { get: `${stubsPath}/get_666_invalidHttpStatus.json` },
    '/get/400_BadRequest': { get: `${stubsPath}/get_400_BadRequest.json` },
    '/get/500_InternalServerError': { get: `${stubsPath}/get_500_InternalServerError.json` },
    '/get/204_NoContent': { get: `${stubsPath}/get_204_NoContent.json` },

    '/post/json': { post: `${stubsPath}/post_200_OK.json` },
    '/put/json': { put: `${stubsPath}/put_200_OK.json` },
    '/patch/json': { patch: `${stubsPath}/patch_200_OK.json` },
    '/delete/json': { delete: `${stubsPath}/delete_200_OK.json` },

    '/posts/:id': { get: 'https://jsonplaceholder.typicode.com' },
    '/unknownHost': { get: 'http://unknown_host.com/' },

    '/multiple/verbs': {
      get: `${stubsPath}/get_200_OK.json`,
      post: `${stubsPath}/post_200_OK.json`,
      put: `${stubsPath}/put_200_OK.json`,
      patch: `${stubsPath}/patch_200_OK.json`,
      delete: `${stubsPath}/delete_200_OK.json`
    },

    // See https://docs.postman-echo.com/?version=latest#083e46e7-53ea-87b1-8104-f8917ce58a17
    '/post': { post: 'https://postman-echo.com' },

    '/multiple/verbs/delay': {
      delay: { min: 2, max: 3 },
      get: `${stubsPath}/get_200_OK.json`,
      post: {
        response: `${stubsPath}/post_200_OK.json`,
        delay: { min: 4, max: 5 }
      },
      put: {
        response: `${stubsPath}/put_200_OK.json`,
        delay: { min: 4, max: 6 }
      }
    },

    '/get/express/ts/:param?': { get: `${stubsPath}/get_express.ts` },
    '/get/express/js/:param?': { get: `${stubsPath}/get_express.js` }
  }
};

export default config;
