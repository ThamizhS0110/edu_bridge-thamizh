const express = require('express');
const {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getReceivedConnectionRequests,
    getSentConnectionRequests
} = require('../controllers/connection.controller');
const { protect, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Junior sends request to senior
router.post('/request', protect, authorizeRoles('junior'), sendConnectionRequest);
// Senior accepts/rejects request
router.put('/accept/:requestId', protect, authorizeRoles('senior'), acceptConnectionRequest);
router.put('/reject/:requestId', protect, authorizeRoles('senior'), rejectConnectionRequest);
// Get requests for senior (received) or junior (sent)
router.get('/requests/received', protect, authorizeRoles('senior'), getReceivedConnectionRequests);
router.get('/requests/sent', protect, authorizeRoles('junior'), getSentConnectionRequests);


module.exports = router;