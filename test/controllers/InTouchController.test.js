/* globals describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const sinon = require('sinon');

describe.only('#InTouchController', () => {
    const id = 'c2d4afa5-3a0f-47e6-adff-5227fc8f1997';

    let sandbox;
    let InTouchController;
    let inTouchController;
    let fakeClient;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // unitTestHelper = UnitTestHelper(sandbox);

        fakeClient = {
            on: () => fakeClient,
            once: () => fakeClient,
            removeListener: () => {},
            send: () => {},
            close: () => {},
            address: () => ({
                address: 'localhost',
                port: 64372
            })
        };

        InTouchController = require('../../src/controllers/InTouchController');
        inTouchController = new InTouchController(id);
    });

    afterEach(() => {
        sandbox.verify();
        sandbox.restore();
    });

    describe('#connect', () => {
        it('should attempt to create a UDP socket');
        it('should wait until the socket is ready');
        it('should reset the sequence number to 1');
    });

    describe('#disconnect', () => {
        it('should close the socket');
        it('should wait until the socket is closed');
        it('should destroy the client');
    });

    describe('#sendAndReceiveMessage', () => {
        let expectedMessage;
        let expectedError;
        let expectedResponse;
        let fakeRemoteInfo;

        beforeEach(async () => {
            expectedMessage = new Buffer('1 - 2');
            expectedError = new Error('Something bad happened');
            expectedResponse = new Buffer('Response message');
            fakeRemoteInfo = {
                address: 'remote',
                port: 1234
            };

            await inTouchController.connect();
        });

        it('should attempt to send the message', async () => {
            sandbox.mock(inTouchController.client)
                .expects('send')
                .withExactArgs(
                    expectedMessage,
                    0,
                    expectedMessage.length,
                    inTouchController.serverPort,
                    inTouchController.serverHost,
                    sinon.match.func
                )
                .once()
                .yields(0, expectedMessage.length);
            sandbox.stub(inTouchController.client, 'once').yields(
                expectedResponse,
                fakeRemoteInfo
            );

            await inTouchController.sendAndReceiveMessage(expectedMessage.toString());

            sandbox.verify();
        });

        it('should populate tokens in the message before sending it', async () => {
            sandbox.mock(inTouchController.client)
                .expects('send')
                .withExactArgs(
                    expectedMessage,
                    0,
                    expectedMessage.length,
                    inTouchController.serverPort,
                    inTouchController.serverHost,
                    sinon.match.func
                )
                .once()
                .yields(0, expectedMessage.length);
            sandbox.stub(inTouchController.client, 'once').yields(
                expectedResponse,
                fakeRemoteInfo
            );

            await inTouchController.sendAndReceiveMessage('${0} - ${1}', 1, 2);

            sandbox.verify();
        });

        it('should throw an exception if the message errors', async () => {
            sandbox.stub(inTouchController.client, 'send').yields(expectedError);

            try {
                await inTouchController.sendAndReceiveMessage('${0} - ${1}', 1, 2);
                assert.fail();
            } catch (error) {
                assert.deepStrictEqual(error, expectedError);
            }
        });

        it('should return the response message', async () => {
            sandbox.stub(inTouchController.client, 'send').yields();
            sandbox.stub(inTouchController.client, 'once').yields(
                expectedResponse,
                fakeRemoteInfo
            );

            const response = await inTouchController.sendAndReceiveMessage('Request');

            assert.deepStrictEqual(response, expectedResponse.toString());
        });

        context('message sequencing', () => {
            const sequenceNumber = 7386;

            beforeEach(() => {
                inTouchController.sequenceNumber = sequenceNumber;
            });

            it('should increment the sequence number if the send is successful', async () => {
                sandbox.stub(inTouchController.client, 'send').yields();
                sandbox.stub(inTouchController.client, 'once').yields(
                    expectedResponse,
                    fakeRemoteInfo
                );

                await inTouchController.sendAndReceiveMessage('Request');

                assert.strictEqual(inTouchController.sequenceNumber, sequenceNumber + 1);
            });

            it('should not change the sequence number if the send fails', async () => {
                sandbox.stub(inTouchController.client, 'send').yields(expectedError);

                try {
                    await inTouchController.sendAndReceiveMessage('Request');
                    assert.fail();
                } catch (error) {
                    assert.strictEqual(inTouchController.sequenceNumber, sequenceNumber);
                }
            });
        });

        it('should not leave any listeners around after a successful response', async () => {
            sandbox.stub(inTouchController.client, 'send').yields();
            sandbox.stub(inTouchController.client, 'once').yields(
                expectedResponse,
                fakeRemoteInfo
            );

            await inTouchController.sendAndReceiveMessage('Request');

            assert.strictEqual(inTouchController.client.listenerCount('message'), 0);
        });

        it('should not leave any listeners around after a failed response', async () => {
            sandbox.stub(inTouchController.client, 'send').yields(expectedError);

            try {
                await inTouchController.sendAndReceiveMessage('Request');
            } catch (error) {

            }

            assert.strictEqual(inTouchController.client.listenerCount('message'), 0);
        });
    });

    describe('#populateMessage', () => {
        it('should replace the sequence number', () => {
            inTouchController.sequenceNumber = 123;

            assert.deepStrictEqual(
                inTouchController.populateMessage('${seq}'),
                '123'
            );
        });

        it('should replace the token with the corresponding argument', () => {
            assert.deepStrictEqual(
                inTouchController.populateMessage('${0} - ${1} - ${2}', 1, 2, 3),
                '1 - 2 - 3'
            );
        });

        it('should replace the token with an empty string if the corresponding argument is null or undefined', () => {
            assert.deepStrictEqual(
                inTouchController.populateMessage('${0} - ${1} - ${2} - ${3}', 1, undefined, null, 4),
                '1 -  -  - 4'
            );
        });
    });

    describe('#receiveMessage', () => {

    });
});
