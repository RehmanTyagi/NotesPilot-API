const express = require('express');

// Protected route middleware
const Protected = require('../middlewares/protect');
const { getProfile, updateProfilePicture, deleteProfilePicture, updateProfile } = require('../controllers/profile');

const Router = express.Router();

Router.use(Protected);

// profile routes
Router.route('/profile').get(getProfile).put(updateProfile)
Router.route('/profile/picture').put(updateProfilePicture).delete(deleteProfilePicture)

module.exports = Router;