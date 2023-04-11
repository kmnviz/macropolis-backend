const express = require('express');
const routes = express.Router();

const createPaymentIntentRoute = require('./create-payment-intent');
const createSubscriptionRoute = require('./create-subscription');
const getPaymentMethodRoute = require('./get-payment-method');
const webhooksRoutes = require('./webhooks');

routes.use('/create-payment-intent', createPaymentIntentRoute);
routes.use('/create-subscription', createSubscriptionRoute);
routes.use('/get-payment-method', getPaymentMethodRoute);
routes.use('/webhooks', webhooksRoutes);

module.exports = routes;
