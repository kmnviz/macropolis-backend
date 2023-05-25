const express = require('express');
const {ObjectId} = require('mongodb');
const routes = express.Router();

routes.get('/', async (req, res) => {

    try {
        const filter = {};
        const options = {
            projection: {
                created_at: 0,
                audio: 0,
                user_id: 0,
            },
        };

        if (req.query?.username) {
            filter.username = req.query.username;
        }

        if (req.query?.type) {
            filter.type = req.query.type;
        }

        if (req.query?.collectionId) {
            const collection = await req.db.collection('collections').findOne({ _id: new ObjectId(req.query.collectionId) });
            if (!collection) {
                return res.status(404).json({
                    message: 'Not found'
                });
            }

            filter._id = { $in: collection.items.map((item) => new ObjectId(item)) };
        }

        if (req.query?.limit) {
            options.limit = parseInt(req.query.limit);
        }

        if (req.query?.sort) {
            options.sort = { _id: req.query.sort === 'desc' ? -1 : 1 };
        }

        const items = await req.db.collection('items').find(filter, options).toArray();

        return res.status(200).json({
            data: { items: items },
            message: 'Items were fetched'
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
