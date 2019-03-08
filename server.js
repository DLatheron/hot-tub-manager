const bodyParser = require('body-parser');
const DAO = require('./src/helpers/DAO');
const express = require('express');
const fs = require('fs');
const Logger = require('./src/Logger');
const MongoClient = require('mongodb').MongoClient;
const nconf = require('nconf');
const promiseRetry = require('promise-retry');

const { version } = require('./package.json');
const { promisify } = require('util');

const yargs = require('yargs')
    .version(version)
    .usage('Hot Tub Manager')
    .strict();

nconf.argv(yargs)
    .env({ lowerCase: true })
    .file('credentials', { file: './credentials.json' })
    .file('config', { file: './config.json' })
    .defaults({
        controller: {
            telemetryIntervalInMs: 60000
        }
    });

const app = express();
const port = nconf.get('port') || 4999;

const readdir = promisify(fs.readdir);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Remove unused warnings as function MUST have 4 parameters.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});

async function registerRoutes(app) {
    const routePath = './src/routes/';
    const routeFiles = await readdir(routePath);

    routeFiles.forEach(routeFile => {
        const routeSrc = require(`${routePath}${routeFile}`);
        const route = new routeSrc();
        route.route(app);
    });
}

function connectToDatabase() {
    const dbUrl = nconf.get('database:url');
    const dbName = nconf.get('database:name');
    const dbOptions = {
        useNewUrlParser: true,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        reconnectTries: 60,
        reconnectInterval: 1000,
        autoReconnect : true,

        ssl: true,
        sslKey: fs.readFileSync('./ssl/mongodb-cert.key'),
        sslCert: fs.readFileSync('./ssl/mongodb-cert.crt'),

        auth: {
            user: nconf.get('mongo:username'),
            password: nconf.get('mongo:password')
        }
    };

    return promiseRetry((retry, number) => {
        Logger.info(`Connecting to database, attempt ${number}...`);

        return new Promise((resolve, reject) => {
            MongoClient.connect(dbUrl, dbOptions, (error, client) => {
                if (error) {
                    return reject(error);
                }

                const database = client.db(dbName);
                Logger.info(`Connected to '${dbName}' at '${dbUrl}'`);

                resolve(database);
            })
        })
        .catch(retry);
    });
}

async function startApp(app, port) {
    app.get('/api/version',
        (req, res) => {
            Logger.info('/api/version');
            res.send({ version });
        }
    );

    const database = await connectToDatabase();
    const dao = new DAO(database);

    await registerRoutes(app);

    app.listen(port, () => Logger.info(`Listening on port ${port}`));

    // TEMPORARY...
    const InTouchController = require('./src/controllers/InTouchController');
    const controller = new InTouchController({
        id: 'c2d4afa5-3a0f-47e6-adff-5227fc8f1997',
        dao
    });

    controller.connect();
    const response = await controller.sendAndReceiveMessage('<HELLO>${seq}</HELLO>');
    Logger.info(response);
    // const response = await controller.receiveMessage();

    //controller.disconnect();
}

startApp(app, port);
