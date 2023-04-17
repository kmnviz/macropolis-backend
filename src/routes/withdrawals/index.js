const express = require('express');
const routes = express.Router();

const availableAmountRoute = require('./available-amount');
const createRoute = require('./create');

routes.use('/available-amount', availableAmountRoute);
routes.use('/create', createRoute);

module.exports = routes;
