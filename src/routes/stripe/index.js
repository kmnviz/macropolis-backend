const express = require('express');
const routes = express.Router();

const createPaymentIntentItemRoute = require('./create-payment-intent-item');
const createPaymentIntentCollectionRoute = require('./create-payment-intent-collection');
const createSubscriptionRoute = require('./create-subscription');
const getPaymentMethodRoute = require('./get-payment-method');
const cancelSubscriptionRoute = require('./cancel-subscription');
const webhooksRoutes = require('./webhooks');

routes.use('/create-payment-intent-item', createPaymentIntentItemRoute);
routes.use('/create-payment-intent-collection', createPaymentIntentCollectionRoute);
routes.use('/create-subscription', createSubscriptionRoute);
routes.use('/get-payment-method', getPaymentMethodRoute);
routes.use('/cancel-subscription', cancelSubscriptionRoute);
routes.use('/webhooks', webhooksRoutes);

module.exports = routes;
