const Chat = require('../models/Chat');
const User = require('../models/User');
const Profile = require('../models/Profile'); // To check if users are connected

// Get user's chats
const getMyChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user.id })
            .populate('participants', 'username name profilePictureUrl')
            .sort({ lastMessageAt: -1 });

        res.status(200).json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching chats' });
    }
};

// Get messages for a specific chat
const getChatMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId).populate('messages.sender', 'username name');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        if (!chat.participants.includes(req.user.id)) {
            return res.status(403).json({ message: 'Unauthorized to view this chat' });
        }

        res.status(200).json(chat.messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    const { chatId, content } = req.body;
    const senderId = req.user.id;

    if (!content) {
        return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    try {
        let chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        if (!chat.participants.includes(senderId)) {
            return res.status(403).json({ message: 'Unauthorized to send message in this chat' });
        }

        // Check if a default message exists and this is the first real message from sender
        if (chat.messages.length === 1 && chat.messages[0].sender.toString() !== senderId) {
            const recipientId = chat.participants.find(p => p.toString() !== senderId.toString());
            const senderProfile = await Profile.findOne({ userId: senderId });
            const recipientProfile = await Profile.findOne({ userId: recipientId });

            // Ensure sender and receiver are connected before allowing further messages
            if (!senderProfile.connections.includes(recipientId) || !recipientProfile.connections.includes(senderId)) {
                return res.status(403).json({ message: 'You can only send messages after the connection request is accepted.' });
            }
        } else if (chat.messages.length === 0) {
             // This case should ideally not happen if chat is initiated with a default message,
             // but as a fallback, ensure connection for first message too.
            const recipientId = chat.participants.find(p => p.toString() !== senderId.toString());
            const senderProfile = await Profile.findOne({ userId: senderId });
            const recipientProfile = await Profile.findOne({ userId: recipientId });

            if (!senderProfile.connections.includes(recipientId) || !recipientProfile.connections.includes(senderId)) {
                return res.status(403).json({ message: 'You can only send messages after the connection request is accepted.' });
            }
        }


        const newMessage = {
            sender: senderId,
            content,
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();
        await chat.save();

        // Emit message via Socket.IO
        req.app.get('socketio').to(chatId).emit('receiveMessage', {
            chatId,
            message: {
                ...newMessage,
                sender: { _id: senderId, username: req.user.username, name: req.user.name } // Send sender info
            }
        });

        res.status(201).json({ message: 'Message sent', chat: newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

// Start a chat (after connection accepted)
const startChat = async (req, res) => {
    const { participantId } = req.body;
    const currentUserId = req.user.id;

    if (participantId.toString() === currentUserId.toString()) {
        return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    try {
        // Check if users are connected
        const currentUserProfile = await Profile.findOne({ userId: currentUserId });
        const participantProfile = await Profile.findOne({ userId: participantId });

        if (!currentUserProfile || !participantProfile ||
            !currentUserProfile.connections.includes(participantId) ||
            !participantProfile.connections.includes(currentUserId)) {
            return res.status(403).json({ message: 'You can only start a chat with connected users.' });
        }

        // Check if a chat already exists between these two users
        let chat = await Chat.findOne({
            participants: { $all: [currentUserId, participantId] },
            'participants.2': { $exists: false } // Ensures only 2 participants
        });

        if (chat) {
            return res.status(200).json({ message: 'Chat already exists', chat });
        }

        // Create new chat
        chat = new Chat({
            participants: [currentUserId, participantId],
            messages: []
        });

        await chat.save();
        res.status(201).json({ message: 'Chat started', chat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error starting chat' });
    }
};


module.exports = { getMyChats, getChatMessages, sendMessage, startChat };