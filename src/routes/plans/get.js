const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const { ObjectId } = require('mongodb');

routes.get('/', async (req, res) => {
    if (!req.query?.id) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    try {
        let plan = await req.db.collection('plans').findOne({
            _id: new ObjectId(req.query.id),
        });

        const stripeClient = new StripeClient();
        const productAndPriceExists = await stripeClient.checkIfProductAndPriceExists(plan.product_id, plan.price_id);

        if (!productAndPriceExists) {
            plan = null;
        }

        delete plan.product_id;
        delete plan.price_id;
        return res.status(200).json({
            data: {
                plan: plan
            },
            message: `Plan was fetched`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
