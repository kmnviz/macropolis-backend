const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');

routes.get('/', async (req, res) => {
    if (!req.query?.id) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    try {
        let subscription = await req.db.collection('subscriptions').findOne({
            _id: new ObjectId(req.query.id),
        });

        const stripeClient = new StripeClient();
        const productAndPriceExists = await stripeClient.checkIfProductAndPriceExists(subscription.product_id, subscription.price_id);

        if (!productAndPriceExists) {
            subscription = null;
        }

        delete subscription.product_id;
        delete subscription.price_id;
        return res.status(200).json({
            data: {
                subscription: subscription
            },
            message: `Subscription was fetched`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
