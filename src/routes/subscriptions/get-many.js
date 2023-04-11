const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');

routes.get('/', async (req, res) => {
    try {
        let subscriptions = await req.db.collection('subscriptions').find().toArray();
        const stripeClient = new StripeClient();

        const subscriptionsResponse = [];
        if (subscriptions.length) {
            subscriptions.forEach((subscription) => {
                if (stripeClient.checkIfProductAndPriceExists(subscription.product_id, subscription.price_id)) {
                    delete subscription.product_id;
                    delete subscription.price_id;
                    subscriptionsResponse.push(subscription);
                }
            });
        }

        return res.status(200).json({
            data: {
                subscriptions: subscriptionsResponse
            },
            message: `Subscriptions were fetched`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
