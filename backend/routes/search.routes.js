const express = require('express');
const { searchProfiles, getDefaultUsers } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, searchProfiles); // Search with query
router.get('/default', protect, getDefaultUsers); // Get default/featured users

module.exports = router;