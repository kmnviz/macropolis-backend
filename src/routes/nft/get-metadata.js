const express = require('express');
const routes = express.Router();
const {ethers} = require('ethers');
const AlchemyClient = require('../../clients/alchemyClient');
const validateEthereumAddress = require('../../helpers/validateEthereumAddress');
const alchemyNetworksEnumerations = require('../../enumerations/alchemyNetworks');
const macropolisNftContractAbi = require('../../contracts/macropolisNFTAbi.json');

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
        let nftMetadataResponse;
        if (contractAddress !== process.env.MACROPOLIS_NFT_CONTRACT_ADDRESS) {
            const alchemyClient = new AlchemyClient(alchemyNetworksEnumerations.ethereumMainnet);
            nftMetadataResponse = await alchemyClient.getNftMetadata(contractAddress, tokenId);

            if (nftMetadataResponse.media.length === 0) {
                return res.status(404).json({ message: 'Hash not found' });
            }
        } else {
            // 0xaD1B50B43979F70e86607979d7EFB3C9085bA07D
            const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
            const wallet = new ethers.Wallet('0xc650862b83ca6540d14a6458d82c746b090dd2c4224baf62630f898a5051472e', provider);
            console.log('wallet: ', wallet);
            const macropolisNftContract = new ethers.Contract(process.env.MACROPOLIS_NFT_CONTRACT_ADDRESS, macropolisNftContractAbi, wallet);
            const tokenUri = await macropolisNftContract.tokenURI('0');
            const tokenDataResponse = await fetch(tokenUri);
            
            nftMetadataResponse = await tokenDataResponse.json();
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
