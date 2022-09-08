import { StubServerConfig } from '../stubServer';

const stubsPath = __dirname;

const config: StubServerConfig = {
  delay: { min: 0, max: 1 },
  routes: {
    '/get/json/noHttpStatus': { GET: `${stubsPath}/GET_noHttpStatus.json` },

    '/get/json/noFile': { GET: `${stubsPath}/GET_200_OK-noFile.json` },
    '/get/png/noFile': { GET: `${stubsPath}/GET_200_OK-noFile.png` },

    '/get/json': { GET: `${stubsPath}/GET_200_OK.json` },

    '/get/png': { GET: `${stubsPath}/GET_200_OK.png` },
    '/get/ts': { GET: `${stubsPath}/GET_200_OK.ts` },
    '/get/js': { GET: `${stubsPath}/GET_200_OK.js` },
    '/get/html': { GET: `${stubsPath}/GET_200_OK.html` },
    '/get/js-with-json-file-extension': {
      GET: `${stubsPath}/GET_js-with-json-file-extension.json`
    },

    '/get/666_invalidHttpStatus': { GET: `${stubsPath}/GET_666_invalidHttpStatus.json` },
    '/get/400_BadRequest': { GET: `${stubsPath}/GET_400_BadRequest.json` },
    '/get/500_InternalServerError': { GET: `${stubsPath}/GET_500_InternalServerError.json` },
    '/get/204_NoContent-empty-txt': { GET: `${stubsPath}/GET_204_NoContent-empty.txt` },
    '/get/204_NoContent-filled-json': { GET: `${stubsPath}/GET_204_NoContent-filled.json` },
    '/get/204_NoContent-empty-json': { GET: `${stubsPath}/GET_204_NoContent-empty.json` },

    '/post/json': { POST: `${stubsPath}/POST_200_OK.json` },
    '/put/json': { PUT: `${stubsPath}/PUT_200_OK.json` },
    '/patch/json': { PATCH: `${stubsPath}/PATCH_200_OK.json` },
    '/delete/json': { DELETE: `${stubsPath}/DELETE_200_OK.json` },

    '/posts/:id': { GET: 'https://jsonplaceholder.typicode.com' },
    '/unknownHost': { GET: 'http://unknown_host.com/' },

    '/multiple/methods': {
      GET: `${stubsPath}/GET_200_OK.json`,
      POST: `${stubsPath}/POST_200_OK.json`,
      PUT: `${stubsPath}/PUT_200_OK.json`,
      PATCH: `${stubsPath}/PATCH_200_OK.json`,
      DELETE: `${stubsPath}/DELETE_200_OK.json`
    },

    // https://docs.postman-echo.com/?version=latest#083e46e7-53ea-87b1-8104-f8917ce58a17
    '/post': { POST: 'https://postman-echo.com' },

    '/multiple/methods/delay': {
      delay: { min: 2, max: 3 },
      GET: `${stubsPath}/GET_200_OK.json`,
      POST: {
        response: `${stubsPath}/POST_200_OK.json`,
        delay: { min: 4, max: 5 }
      },
      PUT: {
        response: `${stubsPath}/PUT_200_OK.json`,
        delay: { min: 4, max: 6 }
      }
    },

    '/root/headers': {
      GET: `${stubsPath}/readHttpHeaders.ts`
    },
    '/multiple/methods/headers': {
      GET: req => {
        req.headers.origin = 'http://GET.com';
        return `${stubsPath}/readHttpHeaders.ts`;
      },
      POST: {
        response: req => {
          req.headers.origin = 'http://POST.com';
          return `${stubsPath}/readHttpHeaders.ts`;
        }
      },
      PUT: {
        response: req => {
          req.headers.origin = 'http://PUT.com';
          return `${stubsPath}/readHttpHeaders.ts`;
        }
      }
    },

    '/get/express-handler/ts/:param?': { GET: `${stubsPath}/GET_express-handler.ts` },
    '/get/express-handler/js/:param?': { GET: `${stubsPath}/GET_express-handler.js` },

    '/function/:param': {
      GET: { response: req => `${stubsPath}/GET_function_200_OK-${req.params.param}.json` },
      POST: req => `${stubsPath}/POST_function_201_Created-${req.params.param}.json`
    }
  }
};

export default config;
