const Chat = require('../models/Chat');
const User = require('../models/User');

// Get user's chats
const getMyChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user.id })
            .populate('participants', 'name student college school image')
            .sort({ lastMessageAt: -1 });

        // Convert any images to base64 for display
        const processedChats = chats.map(chat => {
            const processedParticipants = chat.participants.map(participant => {
                let profileImage = null;
                if (participant.image && participant.image.data) {
                    profileImage = `data:${participant.image.contentType};base64,${participant.image.data.toString('base64')}`;
                }
                return {
                    ...participant.toObject(),
                    profileImage
                };
            });
            return {
                ...chat.toObject(),
                participants: processedParticipants
            };
        });

        res.status(200).json(processedChats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching chats' });
    }
};

// Get messages for a specific chat
const getChatMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId).populate('messages.sender', 'name student');

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
    const chatId = req.params.chatId;
    const { content } = req.body;
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
            return res.status(403).json({ message: 'Unauthorized to send messages in this chat' });
        }

        // Check if users are connected (only after first auto-message)
        if (chat.messages.length > 0) {
            const recipientId = chat.participants.find(p => p.toString() !== senderId.toString());
            const senderUser = await User.findById(senderId);
            const recipientUser = await User.findById(recipientId);

            // Ensure sender and receiver are connected before allowing further messages
            if (!senderUser.connections.includes(recipientId) || !recipientUser.connections.includes(senderId)) {
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
        const io = req.app.get('socketio');
        if (io) {
            io.to(chatId).emit('receiveMessage', {
                chatId,
                message: {
                    ...newMessage,
                    sender: { _id: senderId, name: req.user.name } // Send sender info
                }
            });
        }

        res.status(201).json({ message: 'Message sent', chat: newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

// Start a chat (auto-create if not found)
const startChat = async (req, res) => {
    const { participantId } = req.body;
    const currentUserId = req.user.id;

    if (participantId.toString() === currentUserId.toString()) {
        return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    try {
        // Get user information
        const currentUser = await User.findById(currentUserId);
        const participantUser = await User.findById(participantId);

        if (!participantUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if users are connected
        if (!currentUser.connections.includes(participantId) || 
            !participantUser.connections.includes(currentUserId)) {
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

        // Create new chat with welcome message
        chat = new Chat({
            participants: [currentUserId, participantId],
            messages: [{
                sender: currentUserId,
                content: `Hi, I'm ${currentUser.name}. Great to connect with you on EduBridge!`,
                timestamp: new Date()
            }],
            lastMessageAt: new Date()
        });

        await chat.save();
        res.status(201).json({ message: 'Chat started', chat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error starting chat' });
    }
};

// Auto-create chat for messaging (helper function)
const getOrCreateChat = async (req, res) => {
    const { participantId } = req.body;
    const currentUserId = req.user.id;

    try {
        // Check if chat exists
        let chat = await Chat.findOne({
            participants: { $all: [currentUserId, participantId] },
            'participants.2': { $exists: false }
        });

        if (!chat) {
            // Auto-create chat if users are connected
            const currentUser = await User.findById(currentUserId);
            const participantUser = await User.findById(participantId);

            if (currentUser.connections.includes(participantId) && 
                participantUser.connections.includes(currentUserId)) {
                
                chat = new Chat({
                    participants: [currentUserId, participantId],
                    messages: [],
                    lastMessageAt: new Date()
                });
                await chat.save();
            } else {
                return res.status(403).json({ message: 'Cannot create chat with non-connected users' });
            }
        }

        res.status(200).json({ chat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error getting or creating chat' });
    }
};

module.exports = { getMyChats, getChatMessages, sendMessage, startChat, getOrCreateChat };