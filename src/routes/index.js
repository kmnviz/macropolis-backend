const express = require('express');
const router = express.Router();

const healthchecker = require('./healthchecker');
const usersRoutes = require('./users');
const profilesRoutes = require('./profiles');
const itemsRoutes = require('./items');
const stripeRoutes = require('./stripe');
const salesRoutes = require('./sales');
const plansRoutes = require('./plans');
const withdrawalsRoutes = require('./withdrawals');
const collectionsRoutes = require('./collections');
const downloadsRoutes = require('./downloads');
const nftRoutes = require('./nft');

router.use('/healthcheck', healthchecker)
router.use('/users', usersRoutes);
router.use('/profiles', profilesRoutes);
router.use('/items', itemsRoutes);
router.use('/stripe', stripeRoutes);
router.use('/sales', salesRoutes);
router.use('/plans', plansRoutes);
router.use('/withdrawals', withdrawalsRoutes);
router.use('/collections', collectionsRoutes);
router.use('/downloads', downloadsRoutes);
router.use('/nft', nftRoutes);

module.exports = router;
