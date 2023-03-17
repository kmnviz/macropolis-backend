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

        if (!fields?.name || !fields?.price || !files?.image || !files.audio) {
            return res.status(422).json({ message: 'Missing parameter' });
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
                const filename = `${key}_${newImageFilename}.${imageFileExtension}`;
                const file = googleCloudStorageClient.imagesBucket.file(filename);
                const stream = file.createWriteStream({ resumable: false });
                return new Promise((resolve, reject) => {
                    stream.on('error', (error) => { reject(error); });
                    stream.on('finish', () => { resolve() });
                    stream.end(resizedImageResponse.outputs[key]);
                });
            });

        const newAudioFilename = crypto.randomBytes(28).toString('hex');
        const audioFileExtension = files.audio.originalFilename.split('.').pop();
        const audioFilename = `${newAudioFilename}.${audioFileExtension}`;
        const audioFile = googleCloudStorageClient.audioBucket.file(audioFilename);
        const audioStream = fs.createReadStream(files.audio.filepath);
        const uploadAudioPromise = new Promise((resolve, reject) => {
            let uploadedBytes = 0;
            audioStream.on('data', (chunk) => {
                uploadedBytes += chunk.length;
                const progress = Math.round((uploadedBytes / fs.statSync(files.audio.filepath).size) * 100);
                // TODO: handle upload progress further
                // console.log(`Progress: ${progress}%`);
            });
            audioStream.pipe(audioFile.createWriteStream())
                .on('error', () => { reject() })
                .on('finish', () => { resolve() });
        });

        try {
            await Promise.all([...uploadImagePromises, uploadAudioPromise]);
            record.image = `${newImageFilename}.${imageFileExtension}`;
            record.audio = `${newAudioFilename}.${audioFileExtension}`;
        } catch (error) {
            return res.status(400).json({
                message: 'Something terribly went wrong'
            });
        }

        record.user_id = req.user.id;
        if (fields?.name) record.name = fields.name;
        if (fields?.price) record.price = fields.price;
        record.created_at = Date.now();

        try {
            await req.db.collection('items').insertOne(record);

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
