const express = require('express');
const routes = express.Router();
const { ObjectId } = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const StripeClient = require('../../clients/stripeClient');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        try {
            if (fields?.stripePaymentMethodId) {
                const user = await req.db.collection('users').findOneAndUpdate(
                { _id: new ObjectId(req.user.id) },
                { $set: { stripe_payment_method_id: fields.stripePaymentMethodId } },
                { returnDocument: 'after' }
                );

                const stripeClient = new StripeClient();
                await stripeClient.attachPaymentMethodToCustomer(user.value.stripe_payment_method_id, user.value.stripe_customer_id);
                await stripeClient.updateCustomer(user.value.stripe_customer_id, user.value.stripe_payment_method_id);
            }

            return res.status(200).json({
                data: {
                    user: req.user.id,
                },
                message: `User was updated`,
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
