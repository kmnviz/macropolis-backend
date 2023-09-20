const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const GoogleCloudStorageClient = require('../clients/googleCloudStorageClient');

class ArchiveManager {

    validateArchive(file, size) {
        const allowedExtensions = ['.zip', '.rar'];
        const allowedMimetypes = ['application/zip', 'application/x-rar-compressed'];
        const extension = path.extname(file.originalFilename);
        const mimetype = file.mimetype;

        if (!allowedExtensions.includes(extension) || !allowedMimetypes.includes(mimetype)) {
            return false;
        }

        return file.size <= size;
    }

    async storeToBucket(file) {
        const googleCloudStorageClient = new GoogleCloudStorageClient();

        const newFilename = crypto.randomBytes(28).toString('hex');
        const fileExtension = file.originalFilename.split('.').pop();
        const filename = `${newFilename}.${fileExtension}`;
        const bucketFile = googleCloudStorageClient.archiveBucket.file(filename);
        const stream = fs.createReadStream(file.filepath);

        const uploadPromise = new Promise((resolve, reject) => {
            let uploadedBytes = 0;
            stream.on('data', (chunk) => {
                uploadedBytes += chunk.length;
                const progress = Math.round((uploadedBytes / fs.statSync(file.filepath).size) * 100);
                // TODO: handle upload progress further
                // console.log(`Progress: ${progress}%`);
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

module.exports = ArchiveManager;
