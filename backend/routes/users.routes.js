const express = require('express');
const { getUserProfile, updateMyProfile, updateProfilePicture, upload } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// User profile routes
router.get('/me', protect, getUserProfile); // Get current user's profile
router.get('/:userId', protect, getUserProfile); // Get specific user's profile
router.put('/me', protect, updateMyProfile); // Update current user's profile
router.put('/me/picture', protect, upload.single('profilePicture'), updateProfilePicture); // Update profile picture

module.exports = router;
