const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');

routes.get('/', jwtVerifyMiddleware, async (req, res) => {

    try {
        const user = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
        if (!user?.stripe_payment_method_id) {
            return res.status(200).json({
                data: { paymentMethod: null },
                message: 'Payment method was fetched'
            });
        }

        const stripeClient = new StripeClient();
        const paymentMethod = await stripeClient.getPaymentMethod(user.stripe_payment_method_id);

        return res.status(200).json({
            data: {
                paymentMethod: {
                    last4: paymentMethod.card.last4
                },
            },
            message: `Payment method was fetched`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
