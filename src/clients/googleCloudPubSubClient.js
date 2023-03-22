const { PubSub } = require('@google-cloud/pubsub');

class GoogleCloudPubSubClient {

    constructor() {
        this._client = new PubSub({
            projectId: process.env.GCP_PROJECT_ID,
            credentials: {
                client_email: process.env.GCP_AUTH_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GCP_AUTH_SERVICE_ACCOUNT_PRIVATE_KEY,
            }
        });
    }

    async subscribeToAudioConversionFinishedEvent(itemsDatabaseCollection) {
        const subscription = this._client.subscription(process.env.GCP_PUBSUB_SUBSCRIPTION_AUDIO_CONVERSION_FINISHED);
        subscription.on('message', async (message) => {
            const data = JSON.parse(message.data.toString());
            try {
                await itemsDatabaseCollection.updateOne(
                    { audio: data.name },
                    { $set: { audio_preview: `${data.name.split('.').shift()}.mp3` } }
                );
                await message.ack();
            } catch (error) {
                console.log(`${data.name} failed to ack: `, error);
            }
        });
    }
}

module.exports = GoogleCloudPubSubClient;
