const express = require('express');
const router = express.Router();

const usersRoutes = require('./users');
const profilesRoutes = require('./profiles');
const itemsRoutes = require('./items');

router.use('/users', usersRoutes);
router.use('/profiles', profilesRoutes);
router.use('/items', itemsRoutes);

module.exports = router;
