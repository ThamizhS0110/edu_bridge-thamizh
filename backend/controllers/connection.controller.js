const ConnectionRequest = require('../models/ConnectionRequest');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Send a connection request
const sendConnectionRequest = async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user.id;
    const senderUser = await User.findById(senderId);

    if (senderId === receiverId) {
        return res.status(400).json({ message: 'Cannot send request to self' });
    }

    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
        return res.status(404).json({ message: 'Receiver user not found' });
    }
    // Only juniors can send requests to seniors
    if (senderUser.role !== 'junior' || receiverUser.role !== 'senior') {
        return res.status(403).json({ message: 'Only junior can send requests to senior' });
    }

    try {
        const existingRequest = await ConnectionRequest.findOne({
            senderId,
            receiverId,
            status: 'pending'
        });
        if (existingRequest) {
            return res.status(400).json({ message: 'Connection request already sent' });
        }

        const areConnected = await Profile.findOne({
            userId: senderId,
            connections: receiverId
        });
        if (areConnected) {
            return res.status(400).json({ message: 'Already connected' });
        }

        const newRequest = new ConnectionRequest({
            senderId,
            receiverId,
            defaultMessage: `Hi, I'm ${senderUser.name}. I'd like to connect with you on EduBridge!`
        });
        await newRequest.save();

        // Emit real-time notification to the receiver
        req.app.get('socketio').to(receiverId).emit('newConnectionRequest', {
            senderId: senderUser._id,
            senderName: senderUser.name,
            status: 'pending',
            requestId: newRequest._id
        });

        // Send email notification to the receiver
        const receiverEmail = receiverUser.email;
        const subject = 'New Connection Request on EduBridge!';
        const htmlContent = `<p>Hello ${receiverUser.name},</p>
                            <p>You have a new connection request from <strong>${senderUser.name}</strong> on EduBridge.</p>
                            <p>Log in to your account to accept or reject the request.</p>
                            <p>Best regards,<br>The EduBridge Team</p>`;
        sendEmail(receiverEmail, subject, htmlContent);

        res.status(201).json({ message: 'Connection request sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending connection request' });
    }
};

// Accept a connection request
const acceptConnectionRequest = async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user.id; // The user accepting the request (senior)

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

        // Add each other to connections lists in their profiles
        await Profile.findOneAndUpdate(
            { userId: request.senderId },
            { $addToSet: { connections: request.receiverId } }
        );
        await Profile.findOneAndUpdate(
            { userId: request.receiverId },
            { $addToSet: { connections: request.senderId } }
        );

        const senderUser = await User.findById(request.senderId);
        const receiverUser = await User.findById(request.receiverId);

        // Emit real-time notification to the sender
        req.app.get('socketio').to(request.senderId.toString()).emit('connectionAccepted', {
            receiverId: receiverUser._id,
            receiverName: receiverUser.name,
            requestId: request._id
        });

        // Send email notification to the sender
        const senderEmail = senderUser.email;
        const subject = 'Your EduBridge Connection Request Was Accepted!';
        const htmlContent = `<p>Hello ${senderUser.name},</p>
                            <p>Good news! <strong>${receiverUser.name}</strong> has accepted your connection request on EduBridge.</p>
                            <p>You can now start chatting with them!</p>
                            <p>Best regards,<br>The EduBridge Team</p>`;
        sendEmail(senderEmail, subject, htmlContent);

        res.status(200).json({ message: 'Connection request accepted and users connected!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error accepting connection request' });
    }
};

// Reject a connection request
const rejectConnectionRequest = async (req, res) => {
    const { requestId } = req.params;
    const userId = req.user.id; // The user rejecting the request (senior)

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
        const requests = await ConnectionRequest.find({ receiverId: req.user.id, status: 'pending' })
            .populate('senderId', 'username name profilePictureUrl'); // Populate sender info

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
            .populate('receiverId', 'username name profilePictureUrl'); // Populate receiver info

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