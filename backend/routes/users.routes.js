const express = require('express');
const { getUserProfile, updateMyProfile, updateProfilePicture } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// ✅ FIX: Proper 'me' handler
router.get('/me', protect, getUserProfile); // This should return full profile

router.get('/:userId', protect, getUserProfile);
router.put('/me', protect, updateMyProfile);
router.put('/me/picture', protect, upload.single('profilePicture'), updateProfilePicture);

module.exports = router;
