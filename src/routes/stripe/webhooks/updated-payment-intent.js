const express = require('express');
const routes = express.Router();
const {ObjectId} = require('mongodb');
const {buffer} = require('micro');
const StripeClient = require('../../../clients/stripeClient');
const GoogleCloudStorageClient = require('../../../clients/googleCloudStorageClient');
const MailManager = require('../../../services/mailManager');

routes.post('/', async (req, res) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        const stripeClient = new StripeClient();
        event = stripeClient.client.webhooks.constructEvent(await buffer(req), signature, stripeClient.webhookSecretKey);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;

            let item, user, collection, items = [];

            if (paymentIntent.metadata?.item_id) {
                item = await req.db.collection('items').findOne({
                    _id: new ObjectId(paymentIntent.metadata.item_id)
                });

                if (!item) {
                    console.log(`Webhook for non-existing item ${paymentIntent.metadata.item_id} received. PaymentIntent: ${paymentIntent.id}`);
                    return res.status(200).json({
                        message: 'Something went wrong'
                    });
                }

                user = await req.db.collection('users').findOne({
                    _id: new ObjectId(item.user_id)
                });
                items.push(item);
            } else if (paymentIntent.metadata?.collection_id) {
                collection = await req.db.collection('collections').findOne({
                    _id: new ObjectId(paymentIntent.metadata.collection_id)
                });
                user = await req.db.collection('users').findOne({
                    _id: new ObjectId(collection.user_id)
                });
                items = await req.db.collection('items').find({
                    _id: {
                        $in: collection.items.map((item) => new ObjectId(item))
                    }
                }).toArray();

                if (!items.length) {
                    console.log(`Webhook for collection with no items ${paymentIntent.metadata.collection_id} received. PaymentIntent: ${paymentIntent.id}`);
                    return res.status(400).json({
                        message: 'Something went wrong'
                    });
                }
            } else {
                console.log(`Webhook with no itemId or collectionId received. PaymentIntent: ${paymentIntent.id}`);
                return res.status(200).json({
                    message: 'Something went wrong'
                });
            }

            const googleCloudStorageClient = new GoogleCloudStorageClient();

            const filesForDownload = [];
            for (let i = 0; i < items.length; i++) {
                const filename = items[i][items[i].type].split('.').shift();
                const fileExtension = items[i][items[i].type].split('.').pop();
                const signedUrl = await googleCloudStorageClient.generateSignedUrl(filename, items[i].type, fileExtension);
                filesForDownload.push({
                    name: items[i].name,
                    image: items[i].image,
                    signed_url: signedUrl,
                    file_extension: fileExtension,
                });
            }

            const downloadId = new ObjectId();
            await req.db.collection('downloads').insertOne({
                _id: downloadId,
                files: filesForDownload,
                username: user.username,
                name: item ? item.name : collection.name,
                image: item ? item.image : collection.image,
                created_at: Date.now(),
            });

            await req.db.collection('sales').insertOne({
                user_id: user._id,
                category: item ? 'items' : 'collections',
                item_id: item ? item._id : null,
                collection_id: collection ? collection._id : null,
                bought_by: paymentIntent.metadata.email,
                bought_for: item ? item.price : collection.price,
                created_at: Date.now(),
                stripe_fee: StripeClient.fee(item ? item.price : collection.price),
            });

            const mailManager = new MailManager();
            await mailManager.sendDownloadLink(paymentIntent.metadata.email, downloadId);

            if (item) {
                await mailManager.sendPurchasedItemMessage(user.email, item.name, item.price);
            } else {
                await mailManager.sendPurchasedCollectionMessage(user.email, collection.name, collection.price);
            }

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
