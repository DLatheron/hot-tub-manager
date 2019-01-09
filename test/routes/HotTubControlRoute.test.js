/* globals describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const bodyParser = require('body-parser');
const express = require('express');
const HttpStatusCode = require('http-status-codes');
const proxyquire = require('proxyquire');
const request = require('supertest');
const sinon = require('sinon');
const validate = require('express-validation');

describe('#HotTubControlRoute', () => {
    const hotTubId = 'c2d4afa5-3a0f-47e6-adff-5227fc8f1997';

    let sandbox;
    let app;
    let wrapper;
    let HotTubControlRoute;
    let hotTubControlRoute;
    let fakeRequest;
    let fakeResponse;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        app = express();
        app.use(bodyParser.json());

        wrapper = {
            validate: function() {
                return validate(...arguments);
            }
        };
        fakeRequest = {
            params: {},
            query: {},
            body: {}
        };
        fakeResponse = {
            status: () => fakeResponse,
            send: () => fakeResponse
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
        const acceptableTolerance = 0.00000000001;

        [
            { from: { value: 37.5, units: 'celsius' }, to: { value: 37.5, units: 'centigrade' }},
            { from: { value: 0, units: 'kelvin' }, to: { value: -273.15, units: 'centigrade' }},
            { from: { value: 0, units: 'kelvin' }, to: { value: -459.67, units: 'fahrenheit' }},
            { from: { value: 0, units: 'celsius' }, to: { value: 32, units: 'fahrenheit' }},
            { from: { value: 0, units: 'celsius' }, to: { value: 273.15, units: 'kelvin' }},
        ]
            .forEach(({ from, to }) => {
                it(`should convert ${from.value}° ${from.units} to ${to.value}° ${to.units}`, () => {
                    const toValue = hotTubControlRoute.convertTemperature(
                        from.value,
                        from.units,
                        to.units
                    );

                    assert(Math.abs(to.value - toValue) < acceptableTolerance, 'Converted value is not within tolerance');
                });
            });

        it('should throw if the fromUnits are invalid', () => {
            try {
                hotTubControlRoute.convertTemperature(
                    37.5,
                    'not-a-valid-source-unit',
                    'kelvin'
                );
                assert.fail();
            } catch (error) {
                assert.deepStrictEqual(error, new Error(`Unknown source unit: not-a-valid-source-unit`));
            }
        });

        it('should throw if the toUnits are invalid', () => {
            try {
                hotTubControlRoute.convertTemperature(
                    37.5,
                    'kelvin',
                    'not-a-valid-destination-unit'
                );
                assert.fail();
            } catch (error) {
                assert.deepStrictEqual(error, new Error(`Unknown destination unit: not-a-valid-destination-unit`));
            }
        });
    });

    describe('#getTemperature', () => {
        beforeEach(() => {
            fakeRequest.params.id = hotTubId;
        });

        it('should attempt to convert the temperature into the requested units', async () => {
            fakeRequest.query.units = 'kelvin';

            sandbox.mock(hotTubControlRoute)
                .expects('convertTemperature')
                .withExactArgs(
                    37.5,
                    'celsius',
                    'kelvin'
                )
                .once()
                .returns(310.65);

            await hotTubControlRoute.getTemperature(fakeRequest, fakeResponse);

            sandbox.verify();
        });

        it('should respond with the converted temperature', async () => {
            fakeRequest.query.units = 'kelvin';

            sandbox.stub(hotTubControlRoute, 'convertTemperature').returns(310.65);
            sandbox.mock(fakeResponse)
                .expects('send')
                .withExactArgs({
                    temperature: 310.65,
                    units: 'kelvin'
                });

            await hotTubControlRoute.getTemperature(fakeRequest, fakeResponse);

            sandbox.verify();
        });

        it('should respond with a 200 (OK)', async () => {
            sandbox.stub(hotTubControlRoute, 'convertTemperature').returns(37.5);
            sandbox.mock(fakeResponse)
                .expects('status')
                .withExactArgs(HttpStatusCode.OK)
                .once()
                .returns(fakeResponse);

            await hotTubControlRoute.getTemperature(fakeRequest, fakeResponse);

            sandbox.verify();
        });

        it('should callback if there is an exception', (done) => {
            const expectedError = new Error('An error occurred');

            sandbox.stub(hotTubControlRoute, 'convertTemperature').throws(expectedError);

            hotTubControlRoute.getTemperature(fakeRequest, fakeResponse, (error) => {
                assert.deepStrictEqual(error, expectedError);
                done();
            });
        });

        xit('should get the temperature from the specified hot tub');
    });

    describe('#setTemperature', () => {
        it('should attempt to set the temperature of the hot tub');
        it('should respond with a 200 (OK) if successful');
        it('should respond with a xxx (X) if it fails');
    });
});
