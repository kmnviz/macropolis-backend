const express = require('express');
const routes = express.Router();
const {ObjectId} = require('mongodb');
const {buffer} = require('micro');
const StripeClient = require('../../../clients/stripeClient');
const GoogleCloudStorageClient = require('../../../clients/googleCloudStorageClient');
const MailManager = require('../../../services/mailManager');

routes.post('/', async (req, res) => {
    console.log('enters here [1]');
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        const stripeClient = new StripeClient();
        event = stripeClient.client.webhooks.constructEvent(await buffer(req), signature, stripeClient.webhookSecretKey);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;

            let item, user;
            item = await req.db.collection('items').findOne({_id: new ObjectId(paymentIntent.metadata.item_id)});
            if (item) {
                user = await req.db.collection('users').findOne({_id: new ObjectId(item.user_id)});
            } else {
                console.log(`Webhook for non-existing item ${paymentIntent.metadata.item_id} received. PaymentIntent: ${paymentIntent.id}`);
                return res.status(200).json({
                    message: 'Something went wrong'
                });
            }

            const googleCloudStorageClient = new GoogleCloudStorageClient();
            const filename = item.audio.split('.').shift();
            const fileExtension = item.audio.split('.').pop();

            const signedUrl = await googleCloudStorageClient.generateAudioSignedUrl(filename, fileExtension);
            const mailManager = new MailManager();
            await mailManager.sendDownloadLink(paymentIntent.metadata.email, signedUrl, fileExtension, paymentIntent.metadata.item_id, user.username);
            await mailManager.sendPurchasedItemMessage(user.email, item.name, item.price);

            await req.db.collection('sales').insertOne({
                user_id: user._id,
                item_id: item._id,
                bought_by: paymentIntent.metadata.email,
                bought_for: item.price,
                created_at: Date.now(),
                stripe_fee: StripeClient.fee(item.price),
            });

            return res.status(200).json({
                data: {},
                message: `Updated payment intent handled`
            });
        }
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
