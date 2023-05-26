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
        const download = await req.db.collection('downloads').findOne(
            {
                _id: new ObjectId(req.query.id)
            },
        );

        return res.status(200).json({
            data: { download: download },
            message: 'Download was fetched'
        });
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
