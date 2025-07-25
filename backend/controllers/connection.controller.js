const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Send a connection request
const sendConnectionRequest = async (req, res) => {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
        return res.status(400).json({ message: 'Cannot send request to self' });
    }

    try {
        const senderUser = await User.findById(senderId);
        const receiverUser = await User.findById(receiverId);

        if (!receiverUser) {
            return res.status(404).json({ message: 'Receiver user not found' });
        }
        
        // Role-based request validation - only junior students can send to senior students
        if (senderUser.student !== 'junior' || receiverUser.student !== 'senior') {
            return res.status(403).json({ 
                message: 'Only junior students can send connection requests to senior students' 
            });
        }

        // Check if request already exists
        const existingRequest = await ConnectionRequest.findOne({
            senderId,
            receiverId,
            status: 'pending'
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'Connection request already sent' });
        }

        // Check if already connected
        const areConnected = senderUser.connections.includes(receiverId);
        if (areConnected) {
            return res.status(400).json({ message: 'Already connected' });
        }

        const newRequest = new ConnectionRequest({
            senderId,
            receiverId,
            message: message || '', // Custom message from user
            defaultMessage: `Hi, I'm ${senderUser.name}, I need to chat with you`
        });
        await newRequest.save();

        // Emit real-time notification to the receiver using Socket.IO
        const io = req.app.get('socketio');
        if (io) {
            io.to(receiverId.toString()).emit('newConnectionRequest', {
                senderId: senderUser._id,
                senderName: senderUser.name,
                status: 'pending',
                requestId: newRequest._id
            });
        }

        res.status(201).json({ message: 'Connection request sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending connection request' });
    }
};

// Accept a connection request
const acceptConnectionRequest = async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user.id;

    try {
        const request = await ConnectionRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Connection request not found' });
        }
        if (request.receiverId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to accept this request' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        request.status = 'accepted';
        await request.save();

        // Add each other to connections lists
        await User.findByIdAndUpdate(
            request.senderId,
            { $addToSet: { connections: request.receiverId } }
        );
        await User.findByIdAndUpdate(
            request.receiverId,
            { $addToSet: { connections: request.senderId } }
        );

        const senderUser = await User.findById(request.senderId);
        const receiverUser = await User.findById(request.receiverId);

        // Create a new chat between the connected users with the original request message
        const initialMessage = request.message || request.defaultMessage || `Hi, I'm ${senderUser.name}, I need to chat with you`;
        
        const newChat = new Chat({
            participants: [request.senderId, request.receiverId],
            messages: [{
                sender: request.senderId,
                content: initialMessage,
                timestamp: new Date()
            }],
            lastMessageAt: new Date()
        });
        await newChat.save();

        // Emit real-time notification to the sender
        const io = req.app.get('socketio');
        if (io) {
            io.to(request.senderId.toString()).emit('connectionAccepted', {
                receiverId: receiverUser._id,
                receiverName: receiverUser.name,
                requestId: request._id,
                chatId: newChat._id
            });
        }

        res.status(200).json({ 
            message: 'Connection request accepted and users connected!',
            chatId: newChat._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error accepting connection request' });
    }
};

// Reject a connection request
const rejectConnectionRequest = async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user.id;

    try {
        const request = await ConnectionRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Connection request not found' });
        }
        if (request.receiverId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized to reject this request' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        request.status = 'rejected';
        await request.save();

        res.status(200).json({ message: 'Connection request rejected!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error rejecting connection request' });
    }
};

// Get received connection requests for the logged-in user
const getReceivedConnectionRequests = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ 
            receiverId: req.user.id, 
            status: 'pending' 
        }).populate('senderId', 'name student college school'); // Populate sender info

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching received requests' });
    }
};

// Get sent connection requests by the logged-in user
const getSentConnectionRequests = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ senderId: req.user.id })
            .populate('receiverId', 'name student college school'); // Populate receiver info

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching sent requests' });
    }
};

module.exports = {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getReceivedConnectionRequests,
    getSentConnectionRequests
};