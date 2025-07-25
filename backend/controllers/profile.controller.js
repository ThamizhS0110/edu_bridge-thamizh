const User = require('../models/User');
const multer = require('multer');

// Configure multer for image uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Get user profile (either own or another user's)
const getUserProfile = async (req, res) => {
    try {
        let userId;
        
        // If accessing /users/me, use authenticated user's ID
        if (req.params.userId === undefined || req.params.userId === 'me') {
            userId = req.user.id;
        } else {
            userId = req.params.userId;
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert image buffer to base64 for frontend display
        let profileImage = null;
        if (user.image && user.image.data) {
            profileImage = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
        }

        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            student: user.student,
            college: user.college,
            degree: user.degree,
            fieldOfStudy: user.fieldOfStudy,
            school: user.school,
            grade: user.grade,
            goals: user.goals,
            interests: user.interests,
            bio: user.bio,
            location: user.location,
            preferences: user.preferences,
            connections: user.connections,
            isVerified: user.isVerified,
            isActive: user.isActive,
            profileImage: profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json(userProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// Update my profile
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Handle base64 image upload
        if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image/')) {
            try {
                // Extract the base64 data and content type
                const matches = updateData.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const contentType = matches[1];
                    const base64Data = matches[2];
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    updateData.image = {
                        data: buffer,
                        contentType: contentType
                    };
                } else {
                    delete updateData.image; // Invalid format, skip image update
                }
            } catch (error) {
                console.error('Error processing base64 image:', error);
                delete updateData.image; // Skip image update on error
            }
        }

        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updateData.password;
        delete updateData.email;
        delete updateData._id;
        delete updateData.connections;
        delete updateData.isVerified;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const user = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert image buffer to base64 for frontend display
        let profileImage = null;
        if (user.image && user.image.data) {
            profileImage = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;
        }

        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            student: user.student,
            college: user.college,
            degree: user.degree,
            fieldOfStudy: user.fieldOfStudy,
            school: user.school,
            grade: user.grade,
            goals: user.goals,
            interests: user.interests,
            bio: user.bio,
            location: user.location,
            preferences: user.preferences,
            connections: user.connections,
            isVerified: user.isVerified,
            isActive: user.isActive,
            profileImage: profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: userProfile 
        });
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

        // Update user with image data
        const user = await User.findByIdAndUpdate(
            userId,
            {
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert image buffer to base64 for frontend display
        const profileImage = `data:${user.image.contentType};base64,${user.image.data.toString('base64')}`;

        res.status(200).json({ 
            message: 'Profile picture updated successfully', 
            profileImage: profileImage 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile picture' });
    }
};

// Legacy function for backward compatibility
const getProfile = async (req, res) => {
    // Redirect to getUserProfile
    return getUserProfile(req, res);
};

// Legacy function for backward compatibility  
const updateProfile = async (req, res) => {
    // Redirect to updateMyProfile
    return updateMyProfile(req, res);
};

module.exports = { 
    getUserProfile, 
    updateMyProfile, 
    getProfile, 
    updateProfile, 
    updateProfilePicture,
    upload
};