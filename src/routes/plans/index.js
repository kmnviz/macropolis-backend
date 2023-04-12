const express = require('express');
const routes = express.Router();

const getRoute = require('./get');
const getManyRoute = require('./get-many');

routes.use('/get', getRoute);
routes.use('/get-many', getManyRoute);

module.exports = routes;
