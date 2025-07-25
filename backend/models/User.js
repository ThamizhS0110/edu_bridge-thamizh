const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    student: { 
        type: String, 
        enum: ['school', 'college'], 
        required: true 
    },
    // Image stored as binary data
    image: {
        data: Buffer,
        contentType: String
    },
    // Optional fields for college students
    college: { 
        type: String, 
        trim: true 
    },
    degree: { 
        type: String, 
        trim: true 
    },
    fieldOfStudy: { 
        type: String, 
        trim: true 
    },
    // Optional fields for school students
    school: { 
        type: String, 
        trim: true 
    },
    grade: { 
        type: String, 
        trim: true 
    },
    // Common optional fields
    goals: [{ 
        type: String, 
        trim: true 
    }],
    interests: [{ 
        type: String, 
        trim: true 
    }],
    bio: { 
        type: String, 
        trim: true, 
        maxlength: 500 
    },
    location: { 
        type: String, 
        trim: true 
    },
    // User preferences
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            connectionRequests: { type: Boolean, default: true }
        },
        privacy: {
            profileVisibility: { 
                type: String, 
                enum: ['public', 'connections', 'private'], 
                default: 'public' 
            },
            showEmail: { type: Boolean, default: false }
        }
    },
    // Connection-related fields
    connections: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    // Account status
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true,
    collection: 'EduBridge_users' // Custom collection name
});

// Index for faster searches
userSchema.index({ email: 1 });
userSchema.index({ student: 1 });
userSchema.index({ college: 1 });
userSchema.index({ school: 1 });

module.exports = mongoose.model('User', userSchema);