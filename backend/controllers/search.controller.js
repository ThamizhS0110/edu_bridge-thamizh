const User = require('../models/User');
const ConnectionRequest = require('../models/ConnectionRequest');

const searchProfiles = async (req, res) => {
    const { query = '' } = req.query; // Search query (can be empty for default results)
    const currentUserId = req.user.id;
    const currentUser = req.user;

    try {
        // Only school students (juniors) can access search
        if (currentUser.student !== 'school') {
            return res.status(403).json({ 
                message: 'Only school students can access the search feature' 
            });
        }

        let searchCriteria = {
            _id: { $ne: currentUserId }, // Exclude current user
            student: 'college', // School students can only see college students
            isActive: true // Only show active users
        };

        // If there's a search query, add text-based search criteria
        if (query.trim()) {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { college: { $regex: query, $options: 'i' } },
                { degree: { $regex: query, $options: 'i' } },
                { fieldOfStudy: { $regex: query, $options: 'i' } },
                { interests: { $in: [new RegExp(query, 'i')] } },
                { goals: { $in: [new RegExp(query, 'i')] } }
            ];
        }

        const users = await User.find(searchCriteria)
            .select('-password -email') // Don't send sensitive data
            .limit(50); // Limit results

        // Check connection status for each result
        const results = await Promise.all(users.map(async (user) => {
            // Check if there's a pending connection request
            const connectionStatus = await ConnectionRequest.findOne({
                $or: [
                    { senderId: currentUserId, receiverId: user._id },
                    { senderId: user._id, receiverId: currentUserId }
                ],
                status: 'pending'
            });
            
            // Check if already connected
            const isConnected = currentUser.connections.includes(user._id);

            // Convert image buffer to base64 for frontend display
            let profileImage = null;
            if (user.image && user.image.data) {
                profileImage = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
            }

            return {
                id: user._id,
                name: user.name,
                student: user.student,
                college: user.college,
                degree: user.degree,
                fieldOfStudy: user.fieldOfStudy,
                school: user.school,
                grade: user.grade,
                interests: user.interests,
                goals: user.goals,
                bio: user.bio,
                location: user.location,
                profileImage: profileImage,
                requestSent: !!connectionStatus && connectionStatus.senderId.toString() === currentUserId,
                requestReceived: !!connectionStatus && connectionStatus.receiverId.toString() === currentUserId,
                isConnected: isConnected,
                createdAt: user.createdAt
            };
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during search' });
    }
};

// Get default/featured users (for when search is empty)
const getDefaultUsers = async (req, res) => {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    try {
        // Only school students can access this
        if (currentUser.student !== 'school') {
            return res.status(403).json({ 
                message: 'Only school students can access this feature' 
            });
        }

        // Get recent college users or featured users
        const users = await User.find({
            _id: { $ne: currentUserId },
            student: 'college',
            isActive: true
        })
        .select('-password -email')
        .sort({ createdAt: -1 }) // Most recent first
        .limit(20);

        // Process results similar to search
        const results = await Promise.all(users.map(async (user) => {
            const connectionStatus = await ConnectionRequest.findOne({
                $or: [
                    { senderId: currentUserId, receiverId: user._id },
                    { senderId: user._id, receiverId: currentUserId }
                ],
                status: 'pending'
            });
            
            const isConnected = currentUser.connections.includes(user._id);

            let profileImage = null;
            if (user.image && user.image.data) {
                profileImage = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
            }

            return {
                id: user._id,
                name: user.name,
                student: user.student,
                college: user.college,
                degree: user.degree,
                fieldOfStudy: user.fieldOfStudy,
                interests: user.interests,
                goals: user.goals,
                bio: user.bio,
                location: user.location,
                profileImage: profileImage,
                requestSent: !!connectionStatus && connectionStatus.senderId.toString() === currentUserId,
                requestReceived: !!connectionStatus && connectionStatus.receiverId.toString() === currentUserId,
                isConnected: isConnected,
                createdAt: user.createdAt
            };
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching default users' });
    }
};

module.exports = { searchProfiles, getDefaultUsers };