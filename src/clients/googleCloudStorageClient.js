const { Storage } = require('@google-cloud/storage');

class GoogleCloudStorageClient {

    constructor() {
        this._client = new Storage({
            credentials: {
                client_email: process.env.GCP_AUTH_STORAGE_EMAIL,
                private_key: process.env.GCP_AUTH_STORAGE_PRIVATE_KEY,
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

    async generateSignedUrl(filename, fileExtension) {
        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 999 * 24 * 7, // 7 days
            virtualHostedStyle: true,
            promptSaveAs: `${filename}.${fileExtension}`
        };

        const [url] = await this._client
            .bucket('')
            .file(filename)
            .getSignedUrl(options);

        return url;
    }
}

module.exports = GoogleCloudStorageClient;
