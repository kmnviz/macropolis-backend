const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require("../../middlewares/jwtVerify");
const { ObjectId } = require('mongodb');

routes.delete('/', jwtVerifyMiddleware, async (req, res) => {

    if (!req.query?.id) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    try {
        const collection = await req.db.collection('collections').findOne(
            {
                _id: new ObjectId(req.query.id),
                user_id: req.user.id,
            }
        );

        if (!collection) {
            return res.status(404).json({
                message: 'Not found'
            });
        }

        await req.db.collection('collections').deleteOne({ _id: new ObjectId(req.query.id) });

        return res.status(200).json({
            data: { id: req.query.id },
            message: `Collection was deleted`
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
