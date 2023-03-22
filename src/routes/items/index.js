const express = require('express');
const routes = express.Router();

const createRoute = require('./create');
const updateRoute = require('./update');
const getRoute = require('./get');
const deleteRoute = require('./delete');

routes.use('/create', createRoute);
routes.use('/update', updateRoute);
routes.use('/get', getRoute);
routes.use('/delete', deleteRoute);

module.exports = routes;
