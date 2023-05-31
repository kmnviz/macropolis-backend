const { Network, Alchemy } = require('alchemy-sdk');

class AlchemyClient {

    constructor() {
        this._client = new Alchemy({
            apiKey: process.env.ALCHEMY_API_KEY,
            network: Network.ETH_MAINNET,
        });
    }

    async getNfts(ownerAddress, collectionsAddresses) {
        return await this._client.nft.getNftsForOwner(ownerAddress, {
            contractAddresses: collectionsAddresses,
        });
    }

    async getNftMetadata(contractAddress, tokenId) {
        return await this._client.nft.getNftMetadata(contractAddress, tokenId);
    }
}

module.exports = AlchemyClient;
