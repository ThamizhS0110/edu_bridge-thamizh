const express = require('express');
const { searchProfiles } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, searchProfiles);

module.exports = router;