const fs = require('fs');
const express = require('express');
const Decimal = require('decimal.js');
const crypto = require('crypto');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const ImageManager = require('../../services/imageManager');
const NftManager = require('../../services/nftManager');
const nftTypesEnumerations = require('../../enumerations/nftTypes');
const GoogleCloudStorageClient = require('../../clients/googleCloudStorageClient');
const NftAddressesTypesEnumerations = require('../../enumerations/nftAddressesTypes');

const MacropolisNFTContractAddress = process.env.MACROPOLIS_NFT_CONTRACT_ADDRESS;
const MacropolisNFTContractDeployerAddress = process.env.MACROPOLIS_NFT_CONTRACT_DEPLOYER_ADDRESS;

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.name || !fields?.price || !fields?.type || !files?.image || !files?.nft || !files.nft || !fields.senderAddress) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        if (!/^\d+\.\d{2}$/.test(fields.price)) {
            return res.status(422).json({ message: 'Wrong parameter' });
        }

        if (!Object.values(nftTypesEnumerations).includes(fields.type)) {
            return res.status(422).json({ message: 'Wrong type' });
        }

        const nftManager = new NftManager();
        const imageManager = new ImageManager();
        const googleCloudStorageClient = new GoogleCloudStorageClient();

        const nftMetadata = {};
        nftMetadata.title = `${fields.name} / ${req.user.username} on [MacropolisNFT]`;
        if (fields?.description) nftMetadata.description = fields.description;
        nftMetadata.created_at = Date.now();
        nftMetadata.contract = {};
        nftMetadata.contract.address = MacropolisNFTContractAddress;
        nftMetadata.contract.deployerAddress = MacropolisNFTContractDeployerAddress;
        nftMetadata.contract.name = 'MacropolisNFT';
        nftMetadata.contract.name = 'MRP';
        nftMetadata.contract.tokenType = 'ERC721';
        nftMetadata.media = {};
        nftMetadata.media.filename = `${crypto.randomBytes(28).toString('hex')}.json`
        // nftMetadata.tokenUri = `${googleCloudStorageClient.nftBucketPath}/${nftMetadata.media.filename}`;
        nftMetadata.tokenUri = `${nftMetadata.media.filename}`;

        try {
            if (fields.type === nftTypesEnumerations.IMAGE) {
                if (!imageManager.validateImage(files.nft, 10240 * 10240)) {
                    fs.unlinkSync(files.nft.filepath);
                    return res.status(422).json({ message: 'Wrong parameter' });
                }

                const imageUrl = await nftManager.storeFileToBucket(files.nft);
                nftMetadata.media.image = `${googleCloudStorageClient.imagesBucketPath}/${imageUrl}`;
            }

            if (!imageManager.validateImage(files.image, 10240 * 10240)) {
                fs.unlinkSync(files.image.filepath);
                return res.status(422).json({ message: 'Wrong parameter' });
            } else {
                const thumbnailUrl = await imageManager.storeToBucket(files.nft);
                nftMetadata.media.thumbnail = `${googleCloudStorageClient.imagesBucketPath}/480_${thumbnailUrl}`;
            }

            await nftManager.storeJsonToBucket(nftMetadata, nftMetadata.media.filename);

            await req.db.collection('nft').updateOne(
                {
                    username: req.user.username,
                },
                {
                    $addToSet: {
                        [NftAddressesTypesEnumerations.OWNER]: fields.senderAddress,
                        [NftAddressesTypesEnumerations.COLLECTION]: MacropolisNFTContractAddress,
                    }
                },
                {
                    upsert: true,
                }
            )

            return res.status(200).json({
                data: { 
                    username: req.user.username,
                    tokenUri: nftMetadata.tokenUri,
                 },
                message: `Nft was created`
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
