const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Junior
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Senior
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    defaultMessage: { type: String, default: '' } // Auto-generated message
}, { timestamps: true });

// Ensure unique pending requests
connectionRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);