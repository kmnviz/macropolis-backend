const express = require('express');
const routes = express.Router();
const GoogleCloudStorageClient = require('../../clients/googleCloudStorageClient');
const jwtVerifyMiddleware = require("../../middlewares/jwtVerify");
const { ObjectId } = require('mongodb');

routes.delete('/', jwtVerifyMiddleware, async (req, res) => {

    if (!req.query?.id) {
        return res.status(422).json({ message: 'Missing parameter' });
    }

    try {
        const item = await req.db.collection('items').findOne(
            {
                _id: new ObjectId(req.query.id),
                user_id: req.user.id,
            }
        );

        if (!item) {
            return res.status(404).json({
                message: 'Not found'
            });
        }

        const itemExistsInCollection = await req.db.collection('collections').findOne({
            items: { $in: [item._id] }
        });

        if (itemExistsInCollection) {
            return res.status(406).json({
                message: 'Item persists in a collection. You first need to delete the collection'
            });
        }

        const googleCloudStorageClient = new GoogleCloudStorageClient();
        const audioFile = await googleCloudStorageClient.audioBucket.file(item.audio);
        const audioPreviewFile = await googleCloudStorageClient.audioPreviewBucket.file(item.audio_preview);

        await req.db.collection('items').deleteOne({ _id: new ObjectId(req.query.id) });
        await audioFile.delete();
        await audioPreviewFile.delete();

        return res.status(200).json({
            data: { id: req.query.id },
            message: `Item was deleted`
        });
    } catch (error) {
        console.log('error: ', error);
        return res.status(400).json({
            message: 'Something went wrong'
        });
    }
});

module.exports = routes;
