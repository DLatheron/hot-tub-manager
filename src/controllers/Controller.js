'use strict';

const nconf = require('nconf');

class Controller {
    constructor({ id, dao }) {
        this.id = id;
        this.dao = dao;

        // TODO: Validate the configuration file...

        this.telemetryIntervalInMs = nconf.get('controller:telemetryIntervalInMs');

        if (this.telemetryIntervalInMs) {
            setInterval(
                this.checkTelemetry.bind(
                    this,
                    this.dao.writeTelemetry.bind(this.dao)
                ),
                this.telemetryIntervalInMs
            );
        }
    }

    async checkTelemetry(telemetryWriter) {
        const now = new Date();

        console.log(`Checking hot tub ${this.id} status at ${now.toISOString()}`);

        const telemetry = {
            dateTime: now,
            temperature: 37.5
        };

        telemetryWriter(telemetry);
    }
};

module.exports = Controller;
