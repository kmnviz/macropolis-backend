const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');

routes.get('/', async (req, res) => {
    try {
        let plans = await req.db.collection('plans').find().toArray();
        const stripeClient = new StripeClient();

        const plansResponse = [];
        if (plans.length) {
            plans.forEach((plan) => {
                if (stripeClient.checkIfProductAndPriceExists(plan.product_id, plan.price_id)) {
                    delete plan.product_id;
                    delete plan.price_id;
                    plansResponse.push(plan);
                }
            });
        }

        return res.status(200).json({
            data: {
                plans: plansResponse
            },
            message: `Plans were fetched`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
