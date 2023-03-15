const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const ImageManager = require('../../services/imageManager');
const AudioManager = require('../../services/audioManager');
const GoogleCloudStorageClient = require('../../clients/googleCloudStorageClient');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        const record = {};

        const imageManager = new ImageManager();
        const audioManager = new AudioManager();

        if (!imageManager.validateImage(files.image, 1024 * 1024)) {
            fs.unlinkSync(files.image.filepath);
            return res.status(422).json({ message: 'Wrong parameter' });
        }

        if (!audioManager.validateAudio(files.audio, 200 * 1024 * 1024)) {
            fs.unlinkSync(files.audio.filepath);
            return res.status(422).json({ message: 'Wrong parameter' });
        }

        const imageBuffer = fs.readFileSync(files.image.filepath);
        const resizedImageResponse = await imageManager.resizeImage(imageBuffer);
        const newImageFilename = crypto.randomBytes(28).toString('hex');
        const imageFileExtension = files.image.originalFilename.split('.').pop();

        const googleCloudStorageClient = new GoogleCloudStorageClient();
        const uploadImagePromises = Object.keys(resizedImageResponse.outputs)
            .map((key) => {
                const filename = `${newImageFilename}_${key}.${imageFileExtension}`;
                const file = googleCloudStorageClient.imagesBucket.file(filename);
                const stream = file.createWriteStream({ resumable: false });
                return new Promise((resolve, reject) => {
                    stream.on('error', (error) => { reject(error); });
                    stream.on('finish', () => {resolve()});
                    stream.end(resizedImageResponse.outputs[key]);
                });
            });

        const audioBuffer = fs.readFileSync(files.audio.filepath);
        const newAudioFilename = crypto.randomBytes(28).toString('hex');
        const audioFileExtension = files.audio.originalFilename.split('.').pop();
        const filename = `${newAudioFilename}.${audioFileExtension}`;
        const file = googleCloudStorageClient.audioBucket.file(filename);
        const stream = file.createWriteStream({ resumable: false });
        const uploadAudioPromise = new Promise((resolve, reject) => {
            stream.on('error', (error) => { reject(error); });
            stream.on('finish', () => {resolve()});
            stream.end(audioBuffer);
        });

        try {
            await Promise.all([...uploadImagePromises, uploadAudioPromise]);
            record.image = newImageFilename;
            record.audio = newAudioFilename;
        } catch (error) {
            return res.status(400).json({
                message: 'Something terribly went wrong'
            });
        }

        record.updated_at = Date.now();

        try {
            await req.db.collection('items').updateOne(
                { user_id: req.user.id },
                { $set: record, $setOnInsert: { created_at: Date.now() } },
                { upsert: true }
            );

            return res.status(200).json({
                data: { username: req.user.username },
                message: `Item was created`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
