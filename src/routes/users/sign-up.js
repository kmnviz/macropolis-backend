const crypto = require('crypto');
const bcrypt = require('bcrypt');
const express = require('express');
const routes = express.Router();
const MailManager = require('../../services/mailManager');

const reservedUsernames = ['sign-in', 'sign-up', 'forgot-password', 'checkout', 'dashboard', 'download', '404'];

routes.post('/', async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.username || !fields?.email || !fields?.password) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const user = await req.db.collection('users').findOne({
                $or: [
                    { username: fields.username },
                    { email: fields.email },
                ]
            });

            if (user || reservedUsernames.includes(fields.username)) {
                return res.status(409).json({
                    message: 'Sorry, but username or email are already in use'
                });
            }

            const confirmationHash = crypto.randomBytes(28).toString('hex');
            await req.db.collection('users').insertOne({
                username: fields.username,
                email: fields.email,
                password: await bcrypt.hash(fields.password, 10),
                confirmed: false,
                confirmation_hash: confirmationHash,
                created_at: Date.now(),
            });

            const mailManager = new MailManager();
            try {
                await mailManager.sendSignUpConfirmationRequest(fields.email, fields.username, confirmationHash);
            } catch (error) {
                console.log(`Failed to send sign up confirmation mail to ${fields.email}`);
            }

            return res.status(200).json({
                data: { username: fields.username },
                message: `${fields.username} has successfully registered`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
