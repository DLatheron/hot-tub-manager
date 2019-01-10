/* globals describe, it, beforeEach, afterEach */
'use strict';

const assert = require('assert');
const sinon = require('sinon');

describe('#InTouchController', () => {
    const id = 'c2d4afa5-3a0f-47e6-adff-5227fc8f1997';

    let sandbox;
    let InTouchController;
    let inTouchController;
    let fakeClient;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // unitTestHelper = UnitTestHelper(sandbox);

        fakeClient = {
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

    describe.only('#sendMessage', () => {
        let expectedMessage;
        let expectedError;

        beforeEach(() => {
            expectedMessage = new Buffer('1 - 2');
            expectedError = new Error('Something bad happened');

            inTouchController.client = fakeClient;
        });

        it('should populate the message before sending it', async () => {
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

            await inTouchController.sendMessage('{0} - {1}', 1, 2);

            sandbox.verify();
        });

        it('should throw an exception if the message errors', async () => {
            sandbox.stub(inTouchController.client, 'send').yields(expectedError);

            try {
                await inTouchController.sendMessage('{0} - {1}', 1, 2);
                assert.fail();
            } catch (error) {
                assert.deepStrictEqual(error, expectedError);
            }
        });
    });

    describe('#populateMessage', () => {
        it('should replace the token with the corresponding argument', () => {
            assert.deepStrictEqual(
                inTouchController.populateMessage('{0} - {1} - {2}', 1, 2, 3),
                '1 - 2 - 3'
            );
        });

        it('should replace the token with an empty string if the corresponding argument is null or undefined', () => {
            assert.deepStrictEqual(
                inTouchController.populateMessage('{0} - {1} - {2} - {3}', 1, undefined, null, 4),
                '1 -  -  - 4'
            );
        });
    });

    describe('#receivedMessage', () => {

    });
});
