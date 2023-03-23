const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');

routes.post('/', async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        try {
            const item = await req.db.collection('items').findOne({ _id: new ObjectId(fields.itemId) });

            if (!item) {
                return res.status(200).json({
                    data: { item: item },
                    message: 'Item was fetched'
                });
            }

            const stripeClient = new StripeClient();
            const paymentIntent = await stripeClient.createPaymentIntent(item.price, {
                item_id: item._id.toString(),
                email: fields.email,
            });

            return res.status(200).json({
                data: {
                    payment_intent: {
                        id: paymentIntent.id,
                        client_secret: paymentIntent.client_secret,
                        publishable_key: stripeClient.publishableKey,
                    },
                },
                message: `Payment intent was created`
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
