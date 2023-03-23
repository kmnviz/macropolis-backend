const express = require('express');
const routes = express.Router();

const createPaymentIntentRoute = require('./create-payment-intent');

routes.use('/create-payment-intent', createPaymentIntentRoute);

module.exports = routes;
