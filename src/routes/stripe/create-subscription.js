const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');
const Decimal = require('decimal.js');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.subscriptionId) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const subscription = await req.db.collection('subscriptions').findOne({ _id: new ObjectId(fields.subscriptionId) });
            const user = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });

            if (!subscription) {
                return res.status(200).json({
                    data: { subscription: subscription },
                    message: 'Subscription was fetched'
                });
            }

            const stripeClient = new StripeClient();
            const productAndPriceExists = await stripeClient.checkIfProductAndPriceExists(subscription.product_id, subscription.price_id);

            if (!productAndPriceExists) {
                return res.status(200).json({
                    data: { subscription: null },
                    message: 'Subscription was fetched'
                });
            }

            await stripeClient.createSubscription(user.stripe_customer_id, subscription.price_id);
            await req.db.collection('users').updateOne({
                _id: new ObjectId(req.user.id)
            }, {
                $set: {
                    subscription: subscription.name
                }
            });

            return res.status(200).json({
                data: {
                    subscription: {},
                },
                message: `Subscription was created`
            });
        } catch (error) {
            console.log('error: ', error);
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
