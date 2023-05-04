const fs = require('fs');
const express = require('express');
const Decimal = require('decimal.js');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const ImageManager = require('../../services/imageManager');
const AudioManager = require('../../services/audioManager');
const ArchiveManager = require('../../services/archiveManager');
const itemTypesEnumerations = require('../../enumerations/itemTypes');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.name || !fields?.price || !fields?.type || !files?.image || !files?.item || !files.item) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        if (!/^\d+\.\d{2}$/.test(fields.price)) {
            return res.status(422).json({ message: 'Wrong parameter' });
        }

        if (!Object.values(itemTypesEnumerations).includes(fields.type)) {
            return res.status(422).json({ message: 'Wrong type' });
        }

        const record = {};

        const imageManager = new ImageManager();

        if (!imageManager.validateImage(files.image, 10240 * 10240)) {
            fs.unlinkSync(files.image.filepath);
            return res.status(422).json({ message: 'Wrong parameter' });
        }

        try {
            if (fields.type === itemTypesEnumerations.AUDIO) {
                const audioManager = new AudioManager();

                if (!audioManager.validateAudio(files.item, 200 * 1024 * 1024)) {
                    fs.unlinkSync(files.item.filepath);
                    return res.status(422).json({ message: 'Wrong parameter' });
                }

                record.audio = await audioManager.storeToBucket(files.item);
            } else if (fields.type === itemTypesEnumerations.ARCHIVE) {
                const archiveManager = new ArchiveManager();

                if (!archiveManager.validateArchive(files.item, 200 * 1024 * 1024)) {
                    fs.unlinkSync(files.item.filepath);
                    return res.status(422).json({ message: 'Wrong parameter' });
                }

                record.archive = await archiveManager.storeToBucket(files.item);
            }

            record.image = await imageManager.storeToBucket(files.image);
            record.user_id = req.user.id;
            record.username = req.user.username;
            record.type = fields.type;
            if (fields?.name) record.name = fields.name;
            if (fields?.price) record.price = Decimal(fields.price).mul(100).toString();
            if (fields?.description) record.description = fields.description;
            record.created_at = Date.now();

            await req.db.collection('items').insertOne(record);

            return res.status(200).json({
                data: { username: req.user.username },
                message: `Item was created`
            });
        } catch (error) {
            console.log('error: ', error);
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
