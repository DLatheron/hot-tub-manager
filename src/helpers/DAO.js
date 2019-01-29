'use strict';

class DAO {
    constructor(database) {
        this.database = database;

        this.telemetryCollection = database.collection('telemetry');
    }

    async writeTelemetry({ dateTime, temperature }) {
        await this.telemetryCollection.insert({
            dateTime,
            temperature
        });
    }
}

module.exports = DAO;
