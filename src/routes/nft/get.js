const express = require('express');
const routes = express.Router();
const AlchemyClient = require('../../clients/alchemyClient');

routes.get('/', async (req, res) => {

    if (!req.query?.username) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    try {
        const nft = await req.db.collection('nft').findOne(
            {
                username: req.query.username,
            },
            {
                _id: 0,
            }
        );


        if (req.query?.withOwnedNfts
            && nft
            && nft?.owner
            && nft.owner.length > 0
            && nft?.collection
            && nft.collection.length > 0
        ) {
            const alchemyClient = new AlchemyClient();
            const nftsPromises = [];

            for (let i = 0; i < nft.owner.length; i++) {
                nftsPromises.push(alchemyClient.getNfts(nft.owner[i], nft.collection));
            }

            const nftsResponse = await Promise.all(nftsPromises);
            nft.ownedNfts = nftsResponse.map((nftsResponse) => nftsResponse.ownedNfts).flat();
        }

        return res.status(200).json({
            data: { nft: nft },
            message: 'Nft was fetched'
        });
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
