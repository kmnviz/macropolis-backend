const express = require('express');
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
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
