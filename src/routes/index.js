const express = require('express');
const router = express.Router();

const usersRoutes = require('./users');
const profilesRoutes = require('./profiles');
const itemsRoutes = require('./items');
const stripeRoutes = require('./stripe');
const salesRoutes = require('./sales');

router.use('/users', usersRoutes);
router.use('/profiles', profilesRoutes);
router.use('/items', itemsRoutes);
router.use('/stripe', stripeRoutes);
router.use('/sales', salesRoutes);

module.exports = router;
