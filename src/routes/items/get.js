const express = require('express');
const routes = express.Router();

routes.get('/', async (req, res) => {

    if (!req.query?.username) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    try {
        const items = await req.db.collection('items').find(
            {
                username: req.query.username,
            },
            {
                projection: {
                    created_at: 0,
                    audio: 0,
                    user_id: 0,
                }
            }
        ).toArray();

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
