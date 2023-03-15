const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const ImageManager = require('../../services/imageManager');
const GoogleCloudStorageClient = require('../../clients/googleCloudStorageClient');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        const record = {};

        if (files?.avatar) {
            const imageManager = new ImageManager();
            if (!imageManager.validateImage(files.avatar, 1024 * 1024)) {
                fs.unlinkSync(files.avatar.filepath);
                return res.status(422).json({ message: 'Wrong parameter' });
            }

            const imageBuffer = fs.readFileSync(files.avatar.filepath);
            const resizedImageResponse = await imageManager.resizeImage(imageBuffer);
            const newFilename = crypto.randomBytes(28).toString('hex');
            const fileExtension = files.avatar.originalFilename.split('.').pop();

            const googleCloudStorageClient = new GoogleCloudStorageClient();
            const uploadImagePromises = Object.keys(resizedImageResponse.outputs)
                .map((key) => {
                    const filename = `${newFilename}_${key}.${fileExtension}`;
                    const file = googleCloudStorageClient.imagesBucket.file(filename);
                    const stream = file.createWriteStream({ resumable: false });
                    return new Promise((resolve, reject) => {
                        stream.on('error', (error) => { reject(error); });
                        stream.on('finish', () => {resolve()});
                        stream.end(resizedImageResponse.outputs[key]);
                    });
                });

            try {
                await Promise.all(uploadImagePromises);
                record.avatar = newFilename;
            } catch (error) {
                return res.status(400).json({
                    message: 'Something terribly went wrong'
                });
            }
        }

        if (fields?.name) record.name = fields.name;
        if (fields?.biography) record.biography = fields.biography;
        if (fields?.country) record.country = fields.country;
        record.updated_at = Date.now();

        try {
            await req.db.collection('profiles').updateOne(
                { user_id: req.user.id },
                { $set: record, $setOnInsert: { created_at: Date.now() } },
                { upsert: true }
            );

            return res.status(200).json({
                data: { username: req.user.username },
                message: `Profile was updated`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
