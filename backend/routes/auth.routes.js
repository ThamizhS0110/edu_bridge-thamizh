const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); // Client-side token removal is primary, this is optional

module.exports = router;