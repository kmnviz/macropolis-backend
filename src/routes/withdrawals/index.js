const express = require('express');
const routes = express.Router();

const availableAmountRoute = require('./available-amount');
const createRoute = require('./create');
const getManyRoute = require('./get-many');

routes.use('/available-amount', availableAmountRoute);
routes.use('/create', createRoute);
routes.use('/get-many', getManyRoute);

module.exports = routes;
