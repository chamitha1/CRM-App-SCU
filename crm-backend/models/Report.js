const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true }, // e.g., 'customer', 'asset', 'lead', etc.
    data: { type: mongoose.Schema.Types.Mixed }, // flexible for different report types
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema); 