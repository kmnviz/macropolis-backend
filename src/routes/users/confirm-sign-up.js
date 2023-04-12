const express = require('express');
const routes = express.Router();
const StripeClient = require('../../clients/stripeClient');
const plansEnumerations = require('../../enumerations/plans');

routes.post('/', async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.username || !fields?.confirmationHash) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const stripeClient = new StripeClient();
            const stripeCustomer = await stripeClient.createCustomer(fields.email, fields.username);
            const user = await req.db.collection('users').findOneAndUpdate(
                {
                    username: fields.username,
                    confirmation_hash: fields.confirmationHash,
                },
                {
                    $set: {
                        confirmed: true,
                        updated_at: Date.now(),
                        stripe_customer_id: stripeCustomer.id,
                        plan: plansEnumerations.FREE,
                    },
                    $unset: {
                        confirmation_hash: '',
                    }
                },
                {
                    returnDocument: 'before',
                },
            );

            return res.status(200).json({
                data: { username: user.value ? fields.username : '' },
                message: user.value ? `${fields.username} has confirmed registration` : ''
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
