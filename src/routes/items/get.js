const express = require('express');
const routes = express.Router();
const { ObjectId } = require('mongodb');
const StripeClient = require('../../clients/stripeClient');

routes.get('/', async (req, res) => {

    if (!req.query?.id) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    if (!ObjectId.isValid(req.query.id)) {
        return res.status(422).json({ message: 'Wrong parameter' });
    }

    try {
        const item = await req.db.collection('items').findOne(
            {
                _id: new ObjectId(req.query.id)
            },
            {
                projection: {
                    created_at: 0,
                    audio: 0,
                    user_id: 0,
                }
            }
        );

        if (req.query?.withStripeFee) {
            item.stripe_fee = StripeClient.fee(item.price);
        }

        if (req.query?.withCollections) {
            item.collections = await req.db.collection('collections').find({
                items: { $in: [item._id] }
            }).toArray();
        }

        return res.status(200).json({
            data: { item: item },
            message: 'Item was fetched'
        });
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
