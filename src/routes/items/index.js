const express = require('express');
const routes = express.Router();

const createRoute = require('./create');

routes.use('/create', createRoute);

module.exports = routes;
