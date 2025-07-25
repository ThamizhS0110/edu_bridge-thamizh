const express = require('express');
const { getMyChats, getChatMessages, sendMessage, startChat } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/start', protect, startChat); // Start a new chat with a connected user
router.get('/', protect, getMyChats); // Get all chats for the logged-in user
router.get('/:chatId/messages', protect, getChatMessages); // Get messages for a specific chat
router.post('/:chatId/message', protect, sendMessage); // Send message within a chat

module.exports = router;