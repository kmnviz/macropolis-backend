const express = require('express');
const routes = express.Router();

const updateRoute = require('./update');

routes.use('/update', updateRoute);

module.exports = routes;
