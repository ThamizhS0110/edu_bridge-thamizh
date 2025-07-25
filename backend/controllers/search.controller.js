const User = require('../models/User');
const Profile = require('../models/Profile');

const searchProfiles = async (req, res) => {
    const { query } = req.query; // Search query
    const currentUserProfileId = req.user.id; // Logged-in user's ID

    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        const users = await User.find({
            _id: { $ne: currentUserProfileId }, // Exclude current user's profile
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
            ]
        }).select('_id username name email role');

        const userIds = users.map(user => user._id);

        const profiles = await Profile.find({
            userId: { $in: userIds },
            $or: [
                { schoolName: { $regex: query, $options: 'i' } },
                { collegeName: { $regex: query, $options: 'i' } },
                { department: { $regex: query, $options: 'i' } },
                { interestedDomains: { $regex: query, $options: 'i' } } // Search within array
            ]
        }).populate('userId', 'username name email role');

        // Combine user and profile data, ensuring no duplicates and proper structure
        const combinedResults = {};
        profiles.forEach(profile => {
            if (profile.userId) { // Ensure userId is populated
                combinedResults[profile.userId._id.toString()] = {
                    id: profile.userId._id,
                    username: profile.userId.username,
                    name: profile.userId.name,
                    role: profile.userId.role,
                    profilePictureUrl: profile.profilePictureUrl,
                    schoolName: profile.schoolName,
                    collegeName: profile.collegeName,
                    department: profile.department,
                    bio: profile.bio
                };
            }
        });

        users.forEach(user => {
            if (!combinedResults[user._id.toString()]) {
                combinedResults[user._id.toString()] = {
                    id: user._id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    profilePictureUrl: '', // Default if no profile picture
                    schoolName: '',
                    collegeName: '',
                    department: '',
                    bio: ''
                };
            }
        });

        // Check connection status for each result
        const finalResults = await Promise.all(Object.values(combinedResults).map(async (result) => {
            const connectionStatus = await ConnectionRequest.findOne({
                $or: [
                    { senderId: currentUserProfileId, receiverId: result.id },
                    { senderId: result.id, receiverId: currentUserProfileId }
                ],
                status: 'pending'
            });
            const isConnected = await Profile.findOne({
                userId: currentUserProfileId,
                connections: result.id
            });

            return {
                ...result,
                requestSent: !!connectionStatus && connectionStatus.senderId.toString() === currentUserProfileId,
                requestReceived: !!connectionStatus && connectionStatus.receiverId.toString() === currentUserProfileId,
                isConnected: !!isConnected
            };
        }));


        res.status(200).json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during search' });
    }
};

module.exports = { searchProfiles };