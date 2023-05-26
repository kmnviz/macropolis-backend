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

        try {
            const stripeClient = new StripeClient();
            const item = await req.db.collection('items').findOne({ _id: new ObjectId(fields.itemId) });

            if (!item) {
                return res.status(200).json({
                    data: { item: item },
                    message: 'Item was fetched'
                });
            }

            const totalAmount = new Decimal(item.price).add(StripeClient.fee(item.price)).toNumber();
            const paymentIntent = await stripeClient.createPaymentIntent(totalAmount, {
                item_id: item._id.toString(),
                email: fields.email,
                stripe_fee: StripeClient.fee(item.price),
            });

            return res.status(200).json({
                data: {
                    payment_intent: {
                        id: paymentIntent.id,
                        client_secret: paymentIntent.client_secret,
                        publishable_key: stripeClient.publishableKey,
                        stripe_fee: StripeClient.fee(item.price),
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
