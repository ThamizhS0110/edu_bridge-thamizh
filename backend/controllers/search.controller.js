const User = require('../models/User');
const Profile = require('../models/Profile');
const ConnectionRequest = require('../models/ConnectionRequest'); // Import missing model

const searchProfiles = async (req, res) => {
    const { query } = req.query; // Search query
    const currentUserId = req.user.id; // Logged-in user's ID
    const currentUser = req.user; // Get current user info

    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    try {
        let searchCriteria = {
            _id: { $ne: currentUserId }, // Exclude current user's profile
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
            ]
        };

        // Role-based filtering
        if (currentUser.role === 'junior') {
            // Juniors should only see seniors
            searchCriteria.role = 'senior';
        } else if (currentUser.role === 'senior') {
            // Seniors should only see other seniors (college mates)
            searchCriteria.role = 'senior';
        }

        const users = await User.find(searchCriteria).select('_id username name email role');
        const userIds = users.map(user => user._id);

        let profileSearchCriteria = {
            userId: { $in: userIds },
            $or: [
                { schoolName: { $regex: query, $options: 'i' } },
                { collegeName: { $regex: query, $options: 'i' } },
                { department: { $regex: query, $options: 'i' } },
                { interestedDomains: { $regex: query, $options: 'i' } } // Search within array
            ]
        };

        // For seniors searching other seniors, filter by same college
        if (currentUser.role === 'senior') {
            const currentUserProfile = await Profile.findOne({ userId: currentUserId });
            if (currentUserProfile && currentUserProfile.collegeName) {
                profileSearchCriteria.collegeName = currentUserProfile.collegeName;
            }
        }

        const profiles = await Profile.find(profileSearchCriteria).populate('userId', 'username name email role');

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
                    { senderId: currentUserId, receiverId: result.id },
                    { senderId: result.id, receiverId: currentUserId }
                ],
                status: 'pending'
            });
            
            const isConnected = await Profile.findOne({
                userId: currentUserId,
                connections: result.id
            });

            return {
                ...result,
                requestSent: !!connectionStatus && connectionStatus.senderId.toString() === currentUserId,
                requestReceived: !!connectionStatus && connectionStatus.receiverId.toString() === currentUserId,
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