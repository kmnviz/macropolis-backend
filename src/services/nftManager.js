const GoogleCloudStorageClient = require('../clients/googleCloudStorageClient');
const fs = require('fs');
const crypto = require('crypto');

class NftManager {

    async storeJsonToBucket(data, filename) {
        const googleCloudStorageClient = new GoogleCloudStorageClient();

        try {
            await googleCloudStorageClient.nftBucket.file(filename).save(JSON.stringify(data));

            return filename;
        } catch (error) {
            throw new Error(error);
        }
    }

    async storeFileToBucket(file) {
        const googleCloudStorageClient = new GoogleCloudStorageClient();

        const newFilename = crypto.randomBytes(28).toString('hex');
        const fileExtension = file.originalFilename.split('.').pop();
        const filename = `${newFilename}.${fileExtension}`;
        const bucketFile = googleCloudStorageClient.imagesBucket.file(filename);
        const stream = fs.createReadStream(file.filepath);

        const uploadPromise = new Promise((resolve, reject) => {
            let uploadedBytes = 0;
            stream.on('data', (chunk) => {
                uploadedBytes += chunk.length;
            });
            stream.pipe(bucketFile.createWriteStream())
                .on('error', () => { reject() })
                .on('finish', () => { resolve() });
        });

        try {
            await uploadPromise;

            return `${newFilename}.${fileExtension}`;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = NftManager;
