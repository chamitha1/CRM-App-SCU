const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['sales', 'customer', 'lead', 'appointment', 'asset', 'employee', 'financial', 'custom'],
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    filters: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    schedule: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'none'],
            default: 'none'
        },
        nextRun: {
            type: Date
        },
        recipients: [{
            email: String,
            name: String
        }]
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for better query performance
reportSchema.index({ createdBy: 1, type: 1, status: 1 });
reportSchema.index({ 'schedule.nextRun': 1 });

module.exports = mongoose.model('Report', reportSchema); 