const bcrypt = require('bcrypt');
const express = require('express');
const routes = express.Router();
const jwtVerifyMiddleware = require('../../middlewares/jwtVerify');

routes.post('/', jwtVerifyMiddleware, async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.currentPassword || !fields?.newPassword) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const user = await req.db.collection('users').findOne({ username: req.user.username });
            if (!user || !(await bcrypt.compare(fields.currentPassword, user.password))) {
                return res.status(401).json({
                    message: 'Current password is incorrect'
                });
            }

            await req.db.collection('users').updateOne(
                { username: req.user.username },
                { $set: {
                    password: await bcrypt.hash(fields.newPassword, 10)
                } },
            );

            return res.status(200).json({
                data: { username: req.user.username },
                message: `You have successfully changed your password`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
