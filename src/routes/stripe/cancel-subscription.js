const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const plansEnumerations = require('../../enumerations/plans');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    try {
        const user = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
        const plan = await req.db.collection('plans').findOne({ name: plansEnumerations.FREE });

        if (!user?.stripe_subscription_id) {
            return res.status(200).json({
                data: {
                    user_id: user.id.toString(),
                },
                message: `Subscription was canceled`
            });
        }

        const stripeClient = new StripeClient();
        await stripeClient.cancelSubscription(user.stripe_subscription_id);
        await req.db.collection('users').updateOne({
            _id: new ObjectId(req.user.id)
        }, {
            $set: {
                plan: plansEnumerations.FREE,
            },
            $unset: {
                stripe_subscription_id: '',
            }
        });

        return res.status(200).json({
            data: {
                plan: plan,
                subscription: {
                    id: user.stripe_subscription_id
                },
            },
            message: `Subscription was canceled`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
