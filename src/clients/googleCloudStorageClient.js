const fs = require('fs');
const crypto = require('crypto');
const { Storage } = require('@google-cloud/storage');
const itemTypesEnumerations = require('../enumerations/itemTypes');

class GoogleCloudStorageClient {

    constructor() {
        this._client = new Storage({
            credentials: {
                client_email: process.env.GCP_AUTH_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GCP_AUTH_SERVICE_ACCOUNT_PRIVATE_KEY,
            }
        });
    }

    get client() {
        return this._client;
    }

    get imagesBucket() {
        return this._client.bucket(process.env.GCP_STORAGE_IMAGES_BUCKET);
    }

    get imagesBucketName() {
        return process.env.GCP_STORAGE_IMAGES_BUCKET;
    }

    get imagesBucketPath() {
        return `https://storage.googleapis.com/${process.env.GCP_STORAGE_IMAGES_BUCKET}`;
    }

    get audioBucket() {
        return this._client.bucket(process.env.GCP_STORAGE_AUDIO_BUCKET);
    }

    get audioBucketName() {
        return process.env.GCP_STORAGE_AUDIO_BUCKET;
    }

    get audioBucketPath() {
        return `https://storage.googleapis.com/${process.env.GCP_STORAGE_AUDIO_BUCKET}`;
    }

    get audioPreviewBucket() {
        return this._client.bucket(process.env.GCP_STORAGE_AUDIO_PREVIEW_BUCKET);
    }

    get audioPreviewBucketName() {
        return process.env.GCP_STORAGE_AUDIO_PREVIEW_BUCKET;
    }

    get audioPreviewBucketPath() {
        return `https://storage.googleapis.com/${process.env.GCP_STORAGE_AUDIO_PREVIEW_BUCKET}`;
    }

    get archiveBucket() {
        return this._client.bucket(process.env.GCP_STORAGE_ARCHIVE_BUCKET);
    }

    get archiveBucketName() {
        return process.env.GCP_STORAGE_ARCHIVE_BUCKET;
    }

    get archiveBucketPath() {
        return `https://storage.googleapis.com/${process.env.GCP_STORAGE_ARCHIVE_BUCKET}`;
    }

    async generateSignedUrl(name, itemType, extension) {
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 999 * 24 * 7, // 7 days
            virtualHostedStyle: true,
            promptSaveAs: `${name}.${extension}`
        };

        let bucket;
        if (itemType === itemTypesEnumerations.AUDIO) {
            bucket = this.audioBucket;
        } else if (itemType === itemTypesEnumerations.ARCHIVE) {
            bucket = this.archiveBucket;
        } else {
            throw new Error('Unknown file type');
        }

        const [url] = await bucket.file(`${name}.${extension}`).getSignedUrl(options);

        return url;
    }
}

module.exports = GoogleCloudStorageClient;
