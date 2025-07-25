const express = require('express');
const { getProfile, updateProfile, updateProfilePicture } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware'); // For file uploads

const router = express.Router();

router.get('/:userId', protect, getProfile); // Get a specific user's profile
router.put('/my-profile', protect, updateProfile); // Update logged-in user's profile
router.put('/my-profile/picture', protect, upload.single('profilePicture'), updateProfilePicture);

module.exports = router;