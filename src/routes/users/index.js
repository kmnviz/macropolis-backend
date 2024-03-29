const express = require('express');
const routes = express.Router();

const checkUsernameAvailabilityRoute = require('./check-username-availability');
const signUpRoute = require('./sign-up');
const confirmSignUpRoute = require('./confirm-sign-up');
const signInRoute = require('./sign-in');
const forgotPasswordRoute = require('./forgot-password');
const changePasswordRoute = require('./change-password');
const getUsernamesRoute = require('./get-usernames');
const updateRoute = require('./update');
const getRoute = require('./get');

routes.use('/check-username-availability', checkUsernameAvailabilityRoute);
routes.use('/sign-up', signUpRoute);
routes.use('/confirm-sign-up', confirmSignUpRoute);
routes.use('/sign-in', signInRoute);
routes.use('/forgot-password', forgotPasswordRoute);
routes.use('/change-password', changePasswordRoute);
routes.use('/get-usernames', getUsernamesRoute);
routes.use('/update', updateRoute);
routes.use('/get', getRoute);

module.exports = routes;
