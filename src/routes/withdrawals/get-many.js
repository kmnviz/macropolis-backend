const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');

routes.get('/', jwtVerifyMiddleware, async (req, res) => {

    try {
        const withdrawals = await req.db.collection('withdrawals').find({}).toArray();

        return res.status(200).json({
            data: { withdrawals: withdrawals },
            message: `Withdrawals were fetched`
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
