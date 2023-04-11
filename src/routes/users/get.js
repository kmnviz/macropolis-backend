const express = require('express');
const routes = express.Router();
const { ObjectId } = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');

routes.get('/', jwtVerifyMiddleware, async (req, res) => {

    try {
        const user = await req.db.collection('users').findOne({ _id: new ObjectId(req.user.id) }, {
            projection: {
                password: 0,
                confirmed: 0,
                created_at: 0,
                updated_at: 0,
            }
        });

        return res.status(200).json({
            data: {
                user: user,
            },
            message: `User was fetched`,
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
