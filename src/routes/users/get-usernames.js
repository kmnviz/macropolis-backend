const express = require('express');
const routes = express.Router();

routes.get('/', async (req, res) => {

    try {
        const usernames = await req.db.collection('users').find({}, { projection: { username: 1 } }).toArray();

        return res.status(200).json({
            data: { usernames },
            message: 'Usernames were fetched'
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
