const express = require('express');
const routes = express.Router();

const createRoute = require('./create');
const updateRoute = require('./update');

routes.use('/create', createRoute);
routes.use('/update', updateRoute);

module.exports = routes;
