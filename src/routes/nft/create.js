const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const validateEthereumAddress = require('../../helpers/validateEthereumAddress');
const NftAddressesTypesEnumerations = require('../../enumerations/nftAddressesTypes');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.address || !fields?.type) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        if (!Object.values(NftAddressesTypesEnumerations).includes(fields.type)) {
            return res.status(422).json({ message: 'Wrong parameter' });
        }

        if (!validateEthereumAddress(fields.address)) {
            return res.status(422).json({ message: 'Invalid Ethereum address' });
        }

        try {
            await req.db.collection('nft').updateOne(
                {
                    username: req.user.username,
                },
                {
                    $addToSet: {
                        [fields.type]: fields.address,
                    }
                },
                {
                    upsert: true,
                }
            )

            return res.status(200).json({
                data: {
                    user_id: req.user.id,
                    type: fields.type,
                    address: fields.address,
                },
                message: `Address was created`
            });
        } catch (error) {
            console.log('error: ', error);
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
