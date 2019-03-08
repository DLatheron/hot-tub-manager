'use strict';

class DAO {
    constructor(database) {
        this.database = database;

        this.telemetryCollection = database.collection('telemetry');
    }

    async writeTelemetry({ dateTime, temperature }) {
        await this.telemetryCollection.insertOne({
            dateTime,
            temperature
        });
    }
}

module.exports = DAO;
