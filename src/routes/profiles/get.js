const express = require('express');
const routes = express.Router();
const GoogleCloudStorageClient = require('../../clients/googleCloudStorageClient');

routes.get('/', async (req, res) => {

    if (!req.query?.username) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    try {
        const profile = await req.db.collection('profiles').findOne(
            {
                username: req.query.username,
            },
            {
                projection: {
                    _id: 0,
                    username: 1,
                    name: 1,
                    avatar: 1,
                }
            }
        );

        if (!profile) {
            return res.status(404).json({
                message: 'Not found'
            });
        }

        return res.status(200).json({
            data: { profile: profile },
            message: 'Profile was fetched'
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
