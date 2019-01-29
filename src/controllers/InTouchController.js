'use strict';

const dgram = require('dgram');

const Controller = require('./Controller');
const Logger = require('../Logger');

const messages = {
    hello: '<HELLO>{seq}</HELLO>',
    getCurrentChannel: '<PACKT><SRCCN>${0}</SRCCN><DESCN>${1}</DESCN><DATAS>CURCH${seq}</DATAS></PACKT>',
    getWatercare: '<PACKT><SRCCN>${0}</SRCCN><DESCN>${1}</DESCN><DATAS>GETWC${seq}</DATAS></PACKT>',
	getStatus: '<PACKT><SRCCN>${0}</SRCCN><DESCN>${1}</DESCN><DATAS>STATU${seq}\x00\x00\x02\x00</DATAS></PACKT>'
};

class InTouchController extends Controller {
    constructor(config) {
        super(config);

        this.client = null;
        this.serverHost = 'intouch.geckoal.com';
        this.serverPort = 10022;
        this.sequenceNumber = 0;
    }

    connect() {
        this.client = dgram.createSocket('udp4');
        /*, (msgBuffer, remoteInfo) => {
            const message = msgBuffer.toString();

            Logger.debug(`Received '${message}' (${msgBuffer.length} bytes) from ${remoteInfo.address}:${remoteInfo.port}`);

            // TODO: Handle the message...
        });*/

        return new Promise(resolve => {
            this.client.bind(() => {
                this.sequenceNumber = 1;

                const clientAddress = this.client.address();
                const { address, port } = clientAddress;
                Logger.info(`Listening on: ${address}:${port}`);

                resolve(clientAddress);
            });
        });
    }

    disconnect() {
        if (this.client) {
            return new Promise((resolve, reject) => {
                const { address, port } = this.client.address();

                this.client.close(error => {
                    if (error) return reject(error);
                    Logger.info(`Disconnected from ${address}:${port}`);
                    resolve();
                });
                this.client = null;
            });
        }
    }

    sendAndReceiveMessage(message, ...args) {
        const buffer = new Buffer(this.populateMessage(message, ...args));

        return new Promise((resolve, reject) => {
            const receivedMessageHandler = (messageBytes, remoteInfo) => {
                const message = messageBytes.toString();
                Logger.info(`Received message "${message} (${messageBytes.length} bytes) from: ${remoteInfo.address}:${remoteInfo.port}`);

                resolve(message);
            };
            const removeMessageHandler = () => {
                this.client.removeListener('message', receivedMessageHandler);
            };

            this.client.once('message', receivedMessageHandler);

            this.client.send(buffer, 0, buffer.length, this.serverPort, this.serverHost, (error, bytes) => {
                if (error) {
                    removeMessageHandler();
                    return reject(error);
                }

                Logger.info(`UDP message of ${bytes} bytes sent to ${this.serverHost}:${this.serverPort}`);

                ++this.sequenceNumber;
            });

            // TODO: Establish a timeout???
        });
    }

    _receiveMessage(callback, messageBytes, remoteInfo) {
    }

    populateMessage(message, ...args) {
        args.forEach((arg, index) => {
            const token = `\${${index}}`;
            if (arg === undefined || arg === null) {
                arg = '';
            }
            message = message.replace(token, arg.toString());
        });

        message = message.replace('${seq}', this.sequenceNumber);

        return message;
    }
}

module.exports = InTouchController;
