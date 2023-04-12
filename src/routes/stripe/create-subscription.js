const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const plansEnumerations = require('../../enumerations/plans');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.planId) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const plan = await req.db.collection('plans').findOne({ _id: new ObjectId(fields.planId) });
            const user = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });

            if (!plan) {
                return res.status(400).json({
                    message: 'Something went wrong'
                });
            }

            const stripeClient = new StripeClient();
            const productAndPriceExists = await stripeClient.checkIfProductAndPriceExists(plan.product_id, plan.price_id);

            if (!productAndPriceExists) {
                return res.status(400).json({
                    message: 'Something went wrong'
                });
            }

            const subscription = await stripeClient.createSubscription(user.stripe_customer_id, plan.price_id);
            await req.db.collection('users').updateOne({
                _id: new ObjectId(req.user.id)
            }, {
                $set: {
                    plan: plansEnumerations.ENHANCED,
                }
            });

            return res.status(200).json({
                data: {
                    subscription: subscription,
                },
                message: `Subscription was created`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
