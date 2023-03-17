const fs = require('fs');
const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const ImageManager = require('../../services/imageManager');
const GoogleCloudStorageClient = require("../../clients/googleCloudStorageClient");

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.itemId) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const item = await req.db.collection('items').findOne({ _id: new ObjectId(fields.itemId), user_id: req.user.id });

            if (!item) {
                return res.status(200).json({
                    data: { id: fields.itemId },
                    message: `Item was updated`
                });
            }
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        const record = {};

        if (files?.image) {
            const imageManager = new ImageManager();

            if (!imageManager.validateImage(files.image, 1024 * 1024)) {
                fs.unlinkSync(files.image.filepath);
                return res.status(422).json({ message: 'Wrong parameter' });
            }

            const imageBuffer = fs.readFileSync(files.image.filepath);
            const resizedImageResponse = await imageManager.resizeImage(imageBuffer);
            const newImageFilename = crypto.randomBytes(28).toString('hex');
            const imageFileExtension = files.image.originalFilename.split('.').pop();

            const googleCloudStorageClient = new GoogleCloudStorageClient();
            const uploadImagePromises = Object.keys(resizedImageResponse.outputs)
                .map((key) => {
                    const filename = `${key}_${newImageFilename}.${imageFileExtension}`;
                    const file = googleCloudStorageClient.imagesBucket.file(filename);
                    const stream = file.createWriteStream({ resumable: false });
                    return new Promise((resolve, reject) => {
                        stream.on('error', (error) => { reject(error); });
                        stream.on('finish', () => { resolve() });
                        stream.end(resizedImageResponse.outputs[key]);
                    });
                });

            try {
                await Promise.all([...uploadImagePromises]);
                record.image = `${newImageFilename}.${imageFileExtension}`;
            } catch (error) {
                return res.status(400).json({
                    message: 'Something terribly went wrong'
                });
            }
        }

        if (fields?.name) record.name = fields.name;
        if (fields?.price) record.price = fields.price;
        record.updated_at = Date.now();

        try {
            await req.db.collection('items').updateOne(
                { _id: new ObjectId(fields.itemId), user_id: req.user.id },
                { $set: record }
            );

            return res.status(200).json({
                data: { id: fields.itemId },
                message: `Item was updated`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
