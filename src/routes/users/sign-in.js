const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const routes = express.Router();

routes.post('/', async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.username || !fields?.password) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const user = await req.db.collection('users').findOne({ username: fields.username });

            if (!user || !(await bcrypt.compare(fields.password, user.password))) {
                return res.status(401).json({
                    message: 'Username and/or password are incorrect'
                });
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    username: user.username,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '24h',
                },
            );

            return res.status(200).json({
                data: { token: token },
                message: `${fields.username} has successfully authorized`
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
