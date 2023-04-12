const express = require('express');
const routes = express.Router();
const { ObjectId } = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');

routes.get('/', jwtVerifyMiddleware, async (req, res) => {
    try {
        const pipeline = [
            {
                $match: {
                    _id: new ObjectId(req.user.id),
                }
            },
        ];

        if (req.query?.withPlan) {
            pipeline.push({
                $lookup: {
                    from: 'plans',
                    localField: 'plan',
                    foreignField: 'name',
                    as: 'plan'
                },
            });
            pipeline.push({ $unwind: '$plan' });
        }

        pipeline.push({
            $project: {
                password: 0,
                confirmed: 0,
                created_at: 0,
                updated_at: 0,
                'plan.price_id': 0,
                'plan.product_id': 0,
            }
        });

        const user = await req.db.collection('users').aggregate(pipeline).toArray();

        return res.status(200).json({
            data: {
                user: user[0],
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
