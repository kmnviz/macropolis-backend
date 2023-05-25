const express = require('express');
const routes = express.Router();

const createRoute = require('./create');
const getRoute = require('./get');
const getManyRoute = require('./get-many');
const deleteRoute = require('./delete');

routes.use('/create', createRoute);
routes.use('/get', getRoute);
routes.use('/get-many', getManyRoute);
routes.use('/delete', deleteRoute);

module.exports = routes;
