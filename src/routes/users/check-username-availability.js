const express = require('express');
const routes = express.Router();

const reservedUsernames = ['sign-in', 'sign-up', 'forgot-password', 'checkout', 'dashboard'];

routes.get('/', async (req, res) => {

    try {
        if (!req.query?.username) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        const username = req.query.username;
        const record = await req.db.collection('users').findOne({ username: username });

        if (reservedUsernames.includes(req.query.username)) {
            return res.status(200).json({
                data: { username: req.query.username },
                message: `username '${username}' is already taken`
            });
        }

        return res.status(200).json({
            data: { username: record ? record.username : null },
            message: !record ? 'username is available' : `username '${username}' is already taken`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
