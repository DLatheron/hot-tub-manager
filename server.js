const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const HttpStatusCodes = require('http-status-codes');
const { version } = require('./package.json');
const { promisify } = require('util');

const app = express();
const port = process.env.PORT || 4999;

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

async function startApp(app, port) {
    app.get('/api/version',
        (req, res) => {
            console.log('/api/version');
            res.send({ version });
        }
    );

    await registerRoutes(app);

    app.listen(port, () => console.log(`Listening on port ${port}`));

    // TEMPORARY...
    const InTouchController = require('./src/controllers/InTouchController');
    const controller = new InTouchController('c2d4afa5-3a0f-47e6-adff-5227fc8f1997');

    controller.connect();
    await controller.sendMessage('Hello World');

    controller.disconnect();
}

startApp(app, port);
