import { StubServerConfig } from '../stubServer';

const stubsPath = __dirname;

const config: StubServerConfig = {
  minDelay: 0,
  maxDelay: 0,
  routes: {
    '/get/json/noHttpStatus': { get: `${stubsPath}/get_json_noHttpStatus.json` },

    '/get/json': { get: `${stubsPath}/get_json_200_OK.json` },

    '/get/png': { get: `${stubsPath}/get_png_200_OK.png` },
    '/get/ts': { get: `${stubsPath}/get_ts_200_OK.ts` },
    '/get/js': { get: `${stubsPath}/get_js_200_OK.js` },
    '/get/html': { get: `${stubsPath}/get_html_200_OK.html` },

    '/get/400_BadRequest': { get: `${stubsPath}/get_json_400_BadRequest.json` },
    '/get/500_InternalServerError': { get: `${stubsPath}/get_json_500_InternalServerError.json` },
    '/get/204_NoContent': { get: `${stubsPath}/get_json_204_NoContent.json` },

    '/post/json': { post: `${stubsPath}/post_json_200_OK.json` },
    '/put/json': { put: `${stubsPath}/put_json_200_OK.json` },
    '/patch/json': { patch: `${stubsPath}/patch_json_200_OK.json` },
    '/delete/json': { delete: `${stubsPath}/delete_json_200_OK.json` },

    '/posts/:id': { get: 'https://jsonplaceholder.typicode.com' },

    '/multiple/verbs': {
      get: `${stubsPath}/get_json_200_OK.json`,
      post: `${stubsPath}/post_json_200_OK.json`,
      put: `${stubsPath}/put_json_200_OK.json`,
      patch: `${stubsPath}/patch_json_200_OK.json`,
      delete: `${stubsPath}/delete_json_200_OK.json`
    },

    // See https://docs.postman-echo.com/?version=latest#083e46e7-53ea-87b1-8104-f8917ce58a17
    '/post': { post: 'https://postman-echo.com' }
  }
};

export default config;
