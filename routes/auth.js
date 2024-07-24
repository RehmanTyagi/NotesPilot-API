const express = require('express');
const router = express.Router();

const { register, login, logout, forgotPassword, resetPassword, confirmEmail } = require('../controllers/auth');

router.post('/register', register);
router.get('/confirmemail', confirmEmail);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

module.exports = router;