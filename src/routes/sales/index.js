const express = require('express');
const routes = express.Router();

const getRoute = require('./getMany');

routes.use('/get-many', getRoute);

module.exports = routes;
