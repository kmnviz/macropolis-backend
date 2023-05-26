const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');
const Decimal = require('decimal.js');

routes.post('/', async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.collectionId) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const stripeClient = new StripeClient();
            const collection = await req.db.collection('collections').findOne({ _id: new ObjectId(fields.collectionId) });

            if (!collection) {
                return res.status(404).json({
                    message: 'Not found'
                });
            }

            const totalAmount = new Decimal(collection.price).add(StripeClient.fee(collection.price)).toNumber();
            const paymentIntent = await stripeClient.createPaymentIntent(totalAmount, {
                collection_id: collection._id.toString(),
                email: fields.email,
                stripe_fee: StripeClient.fee(collection.price),
            });

            return res.status(200).json({
                data: {
                    payment_intent: {
                        id: paymentIntent.id,
                        client_secret: paymentIntent.client_secret,
                        publishable_key: stripeClient.publishableKey,
                        stripe_fee: StripeClient.fee(collection.price),
                        total_amount: totalAmount,
                    },
                },
                message: `Payment intent was created`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
