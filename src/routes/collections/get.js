const express = require('express');
const routes = express.Router();
const { ObjectId } = require('mongodb');

routes.get('/', async (req, res) => {

    if (!req.query?.id) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    if (!ObjectId.isValid(req.query.id)) {
        return res.status(422).json({ message: 'Wrong parameter' });
    }

    try {
        const collection = await req.db.collection('collections').findOne(
            {
                _id: new ObjectId(req.query.id)
            },
            {
                projection: {
                    created_at: 0,
                    user_id: 0,
                }
            }
        );

        return res.status(200).json({
            data: { collection: collection },
            message: 'Collection were fetched'
        });
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
