const express = require('express');
const routes = express.Router();
const {ObjectId} = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');

routes.get('/', jwtVerifyMiddleware, async (req, res) => {

    try {
        const sales = await req.db.collection('sales').aggregate([
            {
                $match: {
                    user_id: new ObjectId(req.user.id)
                }
            },
            {
                $lookup: {
                    from: 'items',
                    localField: 'item_id',
                    foreignField: '_id',
                    as: 'item'
                }
            },
            {
                $lookup: {
                    from: 'collections',
                    localField: 'collection_id',
                    foreignField: '_id',
                    as: 'collection'
                }
            },
            {
                $project: {
                    _id: 0,
                    'item._id': 0,
                    'collection._id': 0,
                }
            }
        ]).toArray();

        return res.status(200).json({
            data: {sales: sales},
            message: 'Sales were fetched'
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
