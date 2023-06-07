const express = require('express');
const routes = express.Router();

routes.use((req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        responseTime: process.hrtime.bigint().toString(),
        message: 'OK',
        timestamp: Date.now()
    };

    try {
        res.send(healthcheck);
    } catch (error) {
        healthcheck.message = error;
        res.status(503).send();
    }
});

module.exports = routes;