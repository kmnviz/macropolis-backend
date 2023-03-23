const express = require('express');
const routes = express.Router();

const createPaymentIntentRoute = require('./create-payment-intent');
const webhooksRoutes = require('./webhooks');

routes.use('/create-payment-intent', createPaymentIntentRoute);
routes.use('/webhooks', webhooksRoutes);

module.exports = routes;
