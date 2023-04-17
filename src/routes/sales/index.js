const express = require('express');
const routes = express.Router();

const getRoute = require('./get-many');

routes.use('/get-many', getRoute);

module.exports = routes;
