const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['equipment', 'vehicle', 'property', 'technology', 'furniture', 'other'],
    default: 'equipment'
  },
  type: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  model: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0,
    default: 0
  },
  currentValue: {
    type: Number,
    min: 0,
    default: 0
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged'],
    default: 'good'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired', 'lost'],
    default: 'active'
  },
  location: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  warrantyExpiry: {
    type: Date
  },
  maintenanceSchedule: {
    lastService: Date,
    nextService: Date,
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi-annually', 'annually'],
      default: 'annually'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  tags: [String],
  documents: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
