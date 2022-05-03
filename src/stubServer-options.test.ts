import express from 'express';
import path from 'path';
import request from 'supertest';

import { stubServer } from './stubServer';

const configPath = path.resolve(__dirname, 'config-test', 'config');

test('delay option', async () => {
  {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

    const app = express();
    stubServer(configPath, app, { delay: true });

    await request(app).get('/multiple/methods/delay');
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      expect.stringMatching(
        /^GET \/multiple\/methods\/delay => \/.*\/config-test\/GET_200_OK\.json, delay: (2|3) ms$/
      )
    );

    consoleSpy.mockRestore();
  }

  {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

    const app = express();
    stubServer(configPath, app, { delay: false });

    await request(app).get('/multiple/methods/delay');
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      expect.stringMatching(
        /^GET \/multiple\/methods\/delay => \/.*\/config-test\/GET_200_OK\.json, delay: 0 ms$/
      )
    );

    consoleSpy.mockRestore();
  }
});
