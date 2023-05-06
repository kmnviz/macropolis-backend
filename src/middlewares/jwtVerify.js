const jwt = require('jsonwebtoken');

function jwtVerify(req, res, next) {
    if (!req.cookies?.token) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (error, user) => {
        if (error)
            return res.status(403).json({
                message: 'Not allowed.'
            });

        req.user = user;
        next();
    });
}

module.exports = jwtVerify;
