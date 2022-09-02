/* eslint-disable jest/no-done-callback */

import express from 'express';
import http from 'http';

import { fixRequestBody } from './fixRequestBody';

function noop() {
  // No operation performed
}

const fakeProxyRequest = () => {
  const proxyRequest = new http.ClientRequest('http://some-host');

  // Otherwise we get "Error: getaddrinfo ENOTFOUND some-host"
  proxyRequest.on('error', noop);

  return proxyRequest;
};

test('should not write when body is undefined', done => {
  const proxyRequest = fakeProxyRequest();

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: undefined } as express.Request);

  expect(proxyRequest.setHeader).not.toHaveBeenCalled();
  expect(proxyRequest.write).not.toHaveBeenCalled();

  proxyRequest.on('close', done);
});

test('should not write when body is empty', done => {
  const proxyRequest = fakeProxyRequest();

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: {} } as express.Request);

  expect(proxyRequest.setHeader).not.toHaveBeenCalled();
  expect(proxyRequest.write).not.toHaveBeenCalled();

  proxyRequest.on('close', done);
});

test('should write when body is not empty and Content-Type is application/json', done => {
  const proxyRequest = fakeProxyRequest();
  proxyRequest.setHeader('content-type', 'application/json; charset=utf-8');

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: { someField: 'some value' } } as express.Request);

  const expectedBody = JSON.stringify({ someField: 'some value' });
  expect(proxyRequest.setHeader).toHaveBeenCalledWith('Content-Length', expectedBody.length);
  expect(proxyRequest.write).toHaveBeenCalledWith(expectedBody);

  proxyRequest.on('close', done);
});

test('should write when body is not empty and Content-Type is application/x-www-form-urlencoded', done => {
  const proxyRequest = fakeProxyRequest();
  proxyRequest.setHeader('content-type', 'application/x-www-form-urlencoded');

  jest.spyOn(proxyRequest, 'setHeader');
  jest.spyOn(proxyRequest, 'write');

  fixRequestBody(proxyRequest, { body: { someField: 'some value' } } as express.Request);

  const expectedBody = 'someField=some+value';
  expect(proxyRequest.setHeader).toHaveBeenCalledWith('Content-Length', expectedBody.length);
  expect(proxyRequest.write).toHaveBeenCalledWith(expectedBody);

  proxyRequest.on('close', done);
});
