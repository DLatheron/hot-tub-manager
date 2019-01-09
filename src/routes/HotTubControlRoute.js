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
            id: Joi.string().guid().required()
        },
        query: {
            units: Joi.valid(temperatureUnits.map(unit => unit.name))
        }
    },
    setTemperature: {
        params: {
            id: Joi.string().guid().required(),
            temperature: Joi.number().required()
        },
        query: {
            units: Joi.valid(temperatureUnits.map(unit => unit.name))
        }
    }
};

class HotTubControlRoute {
    constructor() {
    }

    route(app) {
        // TODO: Add Authentication.

        app.get('/api/:id/temperature/',
            validate(validation.getTemperature),
            this.getTemperature.bind(this)
        );
        app.post('/api/:id/temperature/:temperature',
            validate(validation.setTemperature),
            this.setTemperature.bind(this)
        );
    }

    convertTemperature(temperature, srcUnit, dstUnit) {
        const srcUnitType = temperatureUnits.find(unit => unit.name === srcUnit);
        const dstUnitType = temperatureUnits.find(unit => unit.name === dstUnit);

        if (!srcUnitType) { throw new Error(`Unknown source unit: ${srcUnit}`); }
        if (!dstUnitType) { throw new Error(`Unknown destination unit: ${dstUnit}`); }

        if (srcUnitType.type === dstUnitType.type) {
            return temperature;
        }

        const absoluteZero = 273.15;
        let tempInKelvin;

        // Convert into kelvin.
        switch (srcUnit) {
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
        switch (dstUnit) {
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

            // console.log(`Getting temperature for hot-tub '${id}' = ${temperatureInC}℃`);

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

            // TODO: Failure conditions:
            // - Unknown hot tub id;
            // - No rights?
            // - Hot tub did not respond;
            //   - Service currently unavailable?
            // TODO: Actually set the hot-tub to the requested temperature.

            res.status(HttpStatusCodes.OK).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HotTubControlRoute;
