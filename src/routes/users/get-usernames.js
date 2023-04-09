const express = require('express');
const routes = express.Router();

routes.get('/', async (req, res) => {

    try {
        const usernames = await req.db.collection('users').find({}, { projection: { username: 1, _id: 0 } })
            .toArray();

        return res.status(200).json({
            data: { usernames: usernames.map((user) => user.username) },
            message: 'Usernames were fetched'
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
