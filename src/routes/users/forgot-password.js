const crypto = require('crypto');
const bcrypt = require('bcrypt');
const express = require('express');
const MailManager = require("../../services/mailManager");
const routes = express.Router();

routes.post('/', async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.email && (!fields?.newPassword && !fields?.restorePasswordHash)) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            if (fields?.email) {
                const user = await req.db.collection('users').findOne({ email: fields.email });
                if (!user) {
                    return res.status(200).json({
                        data: { email: fields.email },
                        message: `A restore password link is sent to provided email address if exists`
                    });
                }

                const restorePasswordHash = await req.db.collection('restore_password_hashes').findOneAndUpdate(
                    {
                        email: fields.email,
                    },
                    {
                        $set: {
                            hash: crypto.randomBytes(28).toString('hex'),
                            created_at: Date.now()
                        },
                    },
                    {
                        upsert: true,
                        returnDocument: 'after',
                    }
                );

                const mailManager = new MailManager();
                try {
                    await mailManager.sendRestorePasswordLinkRequest(fields.email, restorePasswordHash.value.hash);
                } catch (error) {
                    console.log(`Failed to send restore password mail to ${fields.email}`);
                }

                return res.status(200).json({
                    data: { email: fields.email },
                    message: `A restore password link is sent to provided email address if exists`
                });
            } else {
                const restorePasswordHash = await req.db.collection('restore_password_hashes').findOne({ hash: fields.restorePasswordHash });
                if (!restorePasswordHash) {
                    return res.status(404).json({ message: 'Hash not found' });
                }

                const session = req.dbClient.startSession();
                const transactionOptions = {
                    readPreference: 'primary',
                    readConcern: { level: 'local' },
                    writeConcern: { w: 'majority' }
                };
                try {
                    await session.withTransaction(async () => {
                        await req.db.collection('users').updateOne(
                            { email: restorePasswordHash.email },
                            { $set: {
                                    password: await bcrypt.hash(fields.newPassword, 10)
                                } },
                        );
                        await req.db.collection('restore_password_hashes').deleteOne({ email: restorePasswordHash.email });
                    }, transactionOptions);
                } catch (error) {
                    return res.status(500).json({
                        message: 'Something went totally wrong'
                    });
                } finally {
                    await session.endSession();
                }

                return res.status(200).json({
                    data: { email: restorePasswordHash.email },
                    message: `New password is successfully set`
                });
            }
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
