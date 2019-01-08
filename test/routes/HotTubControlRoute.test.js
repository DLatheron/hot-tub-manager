/* globals describe, it, beforeEach, afterEach */
'use strict';

// const assert = require('assert');
const bodyParser = require('body-parser');
const express = require('express');
const HttpStatusCode = require('http-status-codes');
const proxyquire = require('proxyquire');
const request = require('supertest');
const sinon = require('sinon');
const validate = require('express-validation');

describe('#HotTubControlRoute', () => {
    let sandbox;
    let app;
    let wrapper;
    let HotTubControlRoute;
    let hotTubControlRoute;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        app = express();
        app.use(bodyParser.json());

        wrapper = {
            validate: function() {
                return validate(...arguments);
            }
        };

        HotTubControlRoute = proxyquire('../../src/routes/HotTubControlRoute', {
            'express-validation': function() {
                return wrapper.validate(...arguments);
            }
        });

        hotTubControlRoute = new HotTubControlRoute();
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#constructor', () => {
    });

    describe('#route', () => {
        const baseUrl = `/api`;
        const hotTubId = 'c2d4afa5-3a0f-47e6-adff-5227fc8f1997';
        const routes = [
            {
                method: 'get', routeFn: 'getTemperature', baseUrl: `${baseUrl}/${hotTubId}/temperature/`,
                successes: [
                    { reason: 'no specified units', url: `${baseUrl}/${hotTubId}/temperature/` },
                    { reason: 'units in celsius', url: `${baseUrl}/${hotTubId}/temperature/?units=celsius` },
                    { reason: 'units in centigrade', url: `${baseUrl}/${hotTubId}/temperature/?units=centigrade` },
                    { reason: 'units in fahrenheit', url: `${baseUrl}/${hotTubId}/temperature/?units=fahrenheit` },
                    { reason: 'units in kelvin', url: `${baseUrl}/${hotTubId}/temperature/?units=kelvin` }
                ],
                failures: [
                    { reason: 'an invalid hot tub id', url: `${baseUrl}/not-a-valid-id/temperature/` },
                    { reason: 'invalid units', url: `${baseUrl}/${hotTubId}/temperature/?units=degreesC` },
                    { reason: 'empty units', url: `${baseUrl}/${hotTubId}/temperature/?units=` },
                ]
            },
            {
                method: 'post', routeFn: 'setTemperature', baseUrl: `${baseUrl}/${hotTubId}/temperature/37.5`,
                successes: [
                    { reason: 'no specified units', url: `${baseUrl}/${hotTubId}/temperature/37.5` },
                    { reason: 'units in celsius', url: `${baseUrl}/${hotTubId}/temperature/37.5?units=celsius` },
                    { reason: 'units in centigrade', url: `${baseUrl}/${hotTubId}/temperature/37.5?units=centigrade` },
                    { reason: 'units in fahrenheit', url: `${baseUrl}/${hotTubId}/temperature/37.5?units=fahrenheit` },
                    { reason: 'units in kelvin', url: `${baseUrl}/${hotTubId}/temperature/37.5?units=kelvin` }
                ],
                failures: [
                    { reason: 'an invalid hot tub id', url: `${baseUrl}/not-a-valid-id/temperature/37.5` },
                    { reason: 'an invalid temperature', url: `${baseUrl}/${hotTubId}/temperature/not-a-number` },
                    { reason: 'a missing temperature', url: `${baseUrl}/${hotTubId}/temperature`, statusCode: HttpStatusCode.NOT_FOUND },
                    { reason: 'invalid units', url: `${baseUrl}/${hotTubId}/temperature/37.5?units=degreesC` },
                    { reason: 'empty units', url: `${baseUrl}/${hotTubId}/temperature/37.5?units=` },
                ]
            },
        ];

        function setupRoute() {
            hotTubControlRoute.route(app);

            // Remove unused warnings as function MUST have 4 parameters.
            // eslint-disable-next-line no-unused-vars
            app.use(function(err, req, res, next) {
                res.status(err.status).json(err);
            });
        }

        async function sendAndValidateRequest(method, url, expectedStatusCode = 200, body = {}) {
            return await new Promise((resolve, reject) =>
                request(app)
                    [method](url)
                    .send(body)
                    .expect(expectedStatusCode)
                    .end((error) => {
                        if (error) {
                            return reject(error);
                        }
                        sandbox.verify();
                        resolve();
                    })
            );
        }

        routes.forEach(({
            method,
            routeFn,
            baseUrl,
            successes = [],
            failures = []
        }) => {
            context(`${method.toUpperCase()} ${baseUrl}`, () => {
                context('validation', () => {
                    context('should allow requests with:', () => {
                        successes.forEach(({
                            reason,
                            url = baseUrl,
                            statusCode = 200,
                            body = {}
                        }) => {
                            it(reason, async () => {
                                sandbox.mock(hotTubControlRoute)
                                    .expects(routeFn)
                                    .once()
                                    .callsFake((_, res) => {
                                        res.status(200).send();
                                    });
                                setupRoute();

                                await sendAndValidateRequest(method, url, statusCode, body);
                            });
                        });
                    });

                    context('should reject requests with:', () => {
                        failures.forEach(({
                            reason,
                            url = baseUrl,
                            statusCode = 400,
                            body = {}
                        }) => {
                            it(reason, async () => {
                                sandbox.mock(hotTubControlRoute)
                                    .expects(routeFn)
                                    .never();
                                setupRoute();

                                await sendAndValidateRequest(method, url, statusCode, body);
                            });
                        });
                    });
                });
            });
        });
    });

    describe('#convertTemperature', () => {
        it('should correctly convert a temperature from {...} to {...}')
        it('should throw if the fromUnits are invalid');
        it('should throw if the toUnits are invalid');
    });

    describe('#getTemperature', () => {
        it('should respond with a 200 (OK) and the temperature in {...}');
        it('should callback if there is an exception');
        it('should get the temperature from the specified hot tub');
    });

    describe('#setTemperature', () => {
        it('should respond with a 200 (OK)')
    });
});
