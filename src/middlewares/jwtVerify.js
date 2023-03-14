const jwt = require('jsonwebtoken');

function jwtVerify(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!authHeader || token === null)
        return res.status(401).json({
            message: 'Not authorized.'
        });

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error)
            return res.status(403).json({
                message: 'Not allowed.'
            });

        req.user = user
        next();
    });
}

module.exports = jwtVerify;
