const express = require('express');
const routes = express.Router();

const updatedPaymentIntentRoute = require('./updated-payment-intent');

routes.use('/updated-payment-intent', updatedPaymentIntentRoute);

module.exports = routes;
