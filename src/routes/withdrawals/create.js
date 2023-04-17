const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const Decimal = require('decimal.js');
const {ObjectId} = require('mongodb');
const withdrawalStatuses = require('../../enumerations/withdrawalStatuses');
const AnyApiClient = require('../../clients/anyApiClient');
const validateIban = require('../../helpers/validateIban');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.iban) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

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

            if (new Decimal(availableAmount).lte(0)) {
                return res.status(422).json({ message: 'Not enough amount' });
            }

            // const anyApiClient = new AnyApiClient();
            // const ibanValidationResponse = await anyApiClient.validateIban(fields.iban);
            //
            // if (ibanValidationResponse.data.valid === false) {
            //     return res.status(422).json({ message: 'Invalid IBAN' });
            // }

            if (!validateIban(fields.iban)) {
                return res.status(422).json({ message: 'Invalid IBAN' });
            }

            const withdrawal = await req.db.collection('withdrawals').insertOne({
                user_id: new ObjectId(req.user.id),
                created_at: Date.now(),
                amount: availableAmount,
                status: withdrawalStatuses.REQUESTED,
                metadata: {
                    iban: fields.iban
                }
            });

            return res.status(200).json({
                data: { withdrawal: {
                    id: withdrawal.insertedId,
                } },
                message: `Withdrawal was created`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
