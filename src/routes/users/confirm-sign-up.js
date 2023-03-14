const express = require('express');
const routes = express.Router();

routes.post('/', async (req, res) => {

    req.formidable.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }

        if (!fields?.username || !fields?.confirmationHash) {
            return res.status(422).json({ message: 'Missing parameter' });
        }

        try {
            const user = await req.db.collection('users').findOneAndUpdate(
                {
                    username: fields.username,
                    confirmation_hash: fields.confirmationHash,
                },
                {
                    $set: {
                        confirmed: true,
                        updated_at: Date.now(),
                    },
                    $unset: {
                        confirmation_hash: '',
                    }
                },
                {
                    returnDocument: 'before',
                },
            );

            if (user.value) {
                // await sendMail(user.value.email);
            }

            return res.status(200).json({
                data: { username: user.value ? fields.username : '' },
                message: user.value ? `${fields.username} has confirmed registration` : ''
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Something went wrong'
            });
        }
    });
});

module.exports = routes;
