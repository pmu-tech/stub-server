import express from 'express';
import http from 'http';

import { fixRequestBody } from './fixRequestBody';

const fakeProxyRequest = () => {
  const proxyRequest = new http.ClientRequest('http://some-host');
  proxyRequest.emit = () => false; // Otherwise we get "Error: getaddrinfo ENOTFOUND some-host"

  return proxyRequest;
};

test('should not write when body is undefined', () => {
  const proxyRequest = fakeProxyRequest();

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: undefined } as express.Request);

  expect(proxyRequest.setHeader).not.toHaveBeenCalled();
  expect(proxyRequest.write).not.toHaveBeenCalled();
});

test('should not write when body is empty', () => {
  const proxyRequest = fakeProxyRequest();

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: {} } as express.Request);

  expect(proxyRequest.setHeader).not.toHaveBeenCalled();
  expect(proxyRequest.write).not.toHaveBeenCalled();
});

test('should write when body is not empty and Content-Type is application/json', () => {
  const proxyRequest = fakeProxyRequest();
  proxyRequest.setHeader('content-type', 'application/json; charset=utf-8');

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: { someField: 'some value' } } as express.Request);

  const expectedBody = JSON.stringify({ someField: 'some value' });
  expect(proxyRequest.setHeader).toHaveBeenCalledWith('Content-Length', expectedBody.length);
  expect(proxyRequest.write).toHaveBeenCalledWith(expectedBody);
});

test('should write when body is not empty and Content-Type is application/x-www-form-urlencoded', () => {
  const proxyRequest = fakeProxyRequest();
  proxyRequest.setHeader('content-type', 'application/x-www-form-urlencoded');

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: { someField: 'some value' } } as express.Request);

  const expectedBody = 'someField=some+value';
  expect(proxyRequest.setHeader).toHaveBeenCalledWith('Content-Length', expectedBody.length);
  expect(proxyRequest.write).toHaveBeenCalledWith(expectedBody);
});
