const express = require('express');
const routes = express.Router();

const getRoute = require('./get');

routes.use('/get', getRoute);

module.exports = routes;
