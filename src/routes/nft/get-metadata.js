const express = require('express');
const routes = express.Router();
const AlchemyClient = require('../../clients/alchemyClient');
const validateEthereumAddress = require('../../helpers/validateEthereumAddress');

routes.get('/', async (req, res) => {

    if (!req.query?.id) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    const nftIdParts = req.query.id.split('-');
    if (nftIdParts.length !== 2) {
        return res.status(422).json({ message: 'Wrong parameter' });
    }

    const contractAddress = nftIdParts[0];
    const tokenId = nftIdParts[1];

    if (!validateEthereumAddress(contractAddress)) {
        return res.status(422).json({ message: 'Wrong parameter' });
    }

    try {
        const alchemyClient = new AlchemyClient();
        const nftMetadataResponse = await alchemyClient.getNftMetadata(contractAddress, tokenId);

        console.log(nftMetadataResponse);

        if (nftMetadataResponse.media.length === 0) {
            return res.status(404).json({ message: 'Hash not found' });
        }

        return res.status(200).json({
            data: { nft_metadata: nftMetadataResponse },
            message: 'Nft metadata was fetched'
        });
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
