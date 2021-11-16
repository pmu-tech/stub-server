import { removeSecureFromSetCookie } from './removeSecureFromSetCookie';

test('should remove Secure attribute from Set-Cookie header', () => {
  const proxyRes = {
    headers: {
      'set-cookie': [
        'cookie1=ZYADVSQYTDZA1; Secure; SameSite',
        'cookie2=ZYADVSQYTDZA2; Secure',
        'cookie3=ZYADVSQYTDZA3'
      ]
    }
  };

  removeSecureFromSetCookie(proxyRes);

  expect(proxyRes.headers['set-cookie']).toEqual([
    'cookie1=ZYADVSQYTDZA1; SameSite',
    'cookie2=ZYADVSQYTDZA2',
    'cookie3=ZYADVSQYTDZA3'
  ]);
});

test('do nothing if no Set-Cookie header', () => {
  const proxyRes = {
    headers: {}
  };

  removeSecureFromSetCookie(proxyRes);

  expect(proxyRes.headers).toEqual({});
});
