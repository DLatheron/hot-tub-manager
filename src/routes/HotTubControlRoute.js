const HttpStatusCodes = require('http-status-codes');
const Joi = require('joi');
const validate = require('express-validation');

const temperatureUnits = [
    { name: 'celsius', type: 0 },
    { name: 'centigrade', type: 0 },
    { name: 'fahrenheit', type: 1 },
    { name: 'kelvin', type: 2 }
];

const validation = {
    getTemperature: {
        params: {
            id: Joi.string().required()
        },
        query: {
            units: Joi.valid(temperatureUnits.map(unit => unit.name))
        }
    },
    setTemperature: {
        params: {
            id: Joi.string().required(),
            temperature: Joi.number().min(0).max(50).required()
        },
        query: {
            units: Joi.valid(temperatureUnits.map(unit => unit.name))
        }
    }
};

class HotTubControlRoute {
    constructor() {
        console.info('Constructed HotTubControl');
    }

    route(app) {
        // TODO: Add Authentication.

        app.get('/api/get/temperature/:id',
            validate(validation.getTemperature),
            this.getTemperature.bind(this)
        );
        app.post('/api/set/temperature/:id/:temperature',
            validate(validation.setTemperature),
            this.setTemperature.bind(this)
        );
    }

    convertTemperature(temperature, fromUnits, toUnits) {
        const fromUnitType = temperatureUnits.find(unit => unit.name === fromUnits);
        const toUnitType = temperatureUnits.find(unit => unit.name === toUnits);
        if (!fromUnitType) { throw new Error(`Unknown fromUnits: ${fromUnits}`); }
        if (!toUnitType) { throw new Error(`Unknown toUnits: ${fromUnits}`); }

        if (fromUnitType.type === toUnitType.type) {
            return temperature;
        }

        const absoluteZero = 273.15;
        let tempInKelvin;

        // Convert into kelvin.
        switch (fromUnits) {
            case 'celsius':
            case 'centigrade':
                tempInKelvin = temperature + absoluteZero;
                break;

            case 'fahrenheit':
                tempInKelvin = ((temperature - 32) * 5/9) + absoluteZero;
                break;

            default:
                tempInKelvin = temperature;
                break;
        }

        // Convert into requested units.
        switch (toUnits) {
            case 'celsius':
            case 'centigrade':
                return tempInKelvin - absoluteZero;

            case 'fahrenheit':
                return ((tempInKelvin - absoluteZero) * 9/5) + 32;

            default:
                return tempInKelvin;
        }
    }

    async getTemperature(req, res, next) {
        const { id } = req.params;
        const { units = temperatureUnits[0].name } = req.query;

        try {
            // TODO: Actually get the temperature from the hot-tub.
            const temperatureInC = 37.5;

            console.log(`Getting temperature for hot-tub '${id}' = ${temperatureInC}℃`);

            const temperature = this.convertTemperature(
                temperatureInC,
                'celsius',
                units
            );

            res.status(HttpStatusCodes.OK).send({
                temperature,
                units
            });
        } catch (error) {
            next(error);
        }
    }

    setTemperature(req, res, next) {
        const { id, temperature } = req.params;
        const { units = temperatureUnits[0].name } = req.query;

        try {
            const temperatureInC = this.convertTemperature(
               temperature,
               units,
               'celsius'
            );

            console.log(`Setting temperature for hot-tub '${id}' = ${temperatureInC}℃`);

            // TODO: Actually set the hot-tub to the requested temperature.

            res.status(HttpStatusCodes.OK).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HotTubControlRoute;
