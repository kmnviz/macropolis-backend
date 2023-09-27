const express = require('express');
const routes = express.Router();

const getRoute = require('./get');
const createRoute = require('./create');
const getMetadataRoute = require('./get-metadata');
const createMetadataRoute = require('./create-metadata');

routes.use('/get', getRoute);
routes.use('/create', createRoute);
routes.use('/get-metadata', getMetadataRoute);
routes.use('/create-metadata', createMetadataRoute);

module.exports = routes;
