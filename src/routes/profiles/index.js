const express = require('express');
const routes = express.Router();

const updateRoute = require('./update');
const getRoute = require('./get');

routes.use('/update', updateRoute);
routes.use('/get', getRoute);

module.exports = routes;
