'use strict';

const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'hot-tub-manager.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        name: 'console',
        colorize: true,
        showLevel: true,
        format: winston.format.simple()
    }));
}

module.exports = logger;
