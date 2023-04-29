const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');
const ImageManager = require('../../services/imageManager');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        try {
            const record = {};

            if (files?.avatar) {
                record.avatar = await new ImageManager().storeToBucket(files.avatar);
            } else if (fields?.avatar === '') {
                record.avatar = '';
            }

            if (files?.background) {
                record.background = await new ImageManager().storeToBucket(files.background);
            } else if (fields?.background === '') {
                record.background = '';
            }

            const now = Date.now();
            if (fields?.name) record.name = fields.name;
            if (fields?.biography) record.biography = fields.biography;
            if (fields?.country) record.country = fields.country;
            record.updated_at = now;

            await req.db.collection('profiles').updateOne(
                { username: req.user.username },
                { $set: record, $setOnInsert: { created_at: now } },
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
