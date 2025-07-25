const Profile = require('../models/Profile');
const User = require('../models/User');
const uploadToCloudinary = require('../utils/cloudinary');

// Get user profile (either own or another user's)
const getProfile = async (req, res) => {
    try {
        const userId = req.params.userId === 'my-profile' ? req.user.id : req.params.userId;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ userId: user._id }).populate('userId', 'username name email role');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from authenticated token
        const { bio, schoolName, collegeName, department, interestedDomains, achievements } = req.body;

        const profile = await Profile.findOne({ userId });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Update fields if provided
        if (bio !== undefined) profile.bio = bio;
        if (schoolName !== undefined) profile.schoolName = schoolName;
        if (collegeName !== undefined) profile.collegeName = collegeName;
        if (department !== undefined) profile.department = department;
        if (interestedDomains !== undefined) profile.interestedDomains = interestedDomains;
        if (achievements !== undefined) profile.achievements = achievements;

        await profile.save();
        res.status(200).json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// Upload/Update profile picture
const updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = await uploadToCloudinary(req.file.path);
        if (!imageUrl) {
            return res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
        }

        const profile = await Profile.findOneAndUpdate(
            { userId },
            { profilePictureUrl: imageUrl },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json({ message: 'Profile picture updated successfully', profilePictureUrl: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile picture' });
    }
};

module.exports = { getProfile, updateProfile, updateProfilePicture };