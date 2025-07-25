const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    profilePictureUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    schoolName: { type: String, default: '' },
    collegeName: { type: String, default: '' }, // Only for seniors
    department: { type: String, default: '' }, // For seniors
    interestedDomains: [{ type: String }], // For juniors
    achievements: [{ type: String }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);