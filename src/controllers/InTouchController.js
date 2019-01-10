'use strict';

const dgram = require('dgram');
const { promisify } = require('util');

const Controller = require('./Controller');
const Logger = require('../Logger');

const messages = {
    hello: '<HELLO>{0}</HELLO>',
    getCurrentChannel: '<PACKT><SRCCN>{0}</SRCCN><DESCN>{1}</DESCN><DATAS>CURCH{2}</DATAS></PACKT>',
    getWatercare: '<PACKT><SRCCN>{0}</SRCCN><DESCN>{1}</DESCN><DATAS>GETWC{2}</DATAS></PACKT>',
	getStatus: '<PACKT><SRCCN>{0}</SRCCN><DESCN>{1}</DESCN><DATAS>STATU{2}\x00\x00\x02\x00</DATAS></PACKT>'
}

class InTouchController extends Controller {
    constructor(id) {
        super(id);

        this.client = null;
        this.serverHost = 'intouch.geckoal.com';
        this.serverPort = 10022;
        this.sequenceNumber = 0;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client = dgram.createSocket('udp4', (error) => {
                if (error) return reject(error);

                const { address, port } = this.client.address();
                Logger.info(`Listening on: ${address}:${port}`);

                this.sequenceNumber = 1;

                resolve();
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

    sendMessage(message, ...args) {
        const buffer = new Buffer(this.populateMessage(message, ...args));

        return new Promise((resolve, reject) => {
            this.client.send(buffer, 0, buffer.length, this.serverPort, this.serverHost, (error, bytes) => {
                if (error) return reject(error);
                Logger.info(`UDP message of ${bytes} bytes sent to ${this.serverHost}:${this.serverPort}`);
                resolve();
            });
        });
    }

    populateMessage(message, ...args) {
        args.forEach((arg, index) => {
            const token = `{${index}}`;
            if (arg === undefined || arg === null) {
                arg = '';
            }
            message = message.replace(token, arg.toString());
        });

        return message;
    }

    receiveMessage() {
    }
}

module.exports = InTouchController;
