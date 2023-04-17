const express = require('express');
const routes = express.Router();
const { ObjectId } = require('mongodb');
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const Decimal = require("decimal.js");

routes.get('/', jwtVerifyMiddleware, async (req, res) => {

    try {
        const lastWithdrawal = await req.db.collection('withdrawals').findOne({}, {
            sort: { created_at: -1 }
        });
        const userSales = await req.db.collection('sales').find({
            user_id: new ObjectId(req.user.id),
            created_at: {
                $gte: lastWithdrawal ? lastWithdrawal.created_at : 0
            }
        }).toArray();
        const availableAmount = userSales.reduce((total, sale) => {
            return total.plus(new Decimal(sale.bought_for));
        }, new Decimal(0)).toString();

        return res.status(200).json({
            data: { availableAmount: availableAmount },
            message: `Withdrawal available amount was fetched`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
