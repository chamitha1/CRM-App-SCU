const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    maxLength: [100, 'Asset name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Asset type is required'],
    enum: ['Heavy Equipment', 'Lifting Equipment', 'Tools', 'Vehicles', 'Other'],
    default: 'Other'
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    maxLength: [50, 'Serial number cannot exceed 50 characters']
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxLength: [100, 'Location cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'out-of-service'],
    default: 'available'
  },
  assignedTo: {
    type: String,
    trim: true,
    maxLength: [100, 'Assigned to cannot exceed 100 characters']
  },
  lastMaintenance: {
    type: Date
  },
  maintenanceHistory: [{
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true,
      maxLength: [500, 'Maintenance description cannot exceed 500 characters']
    },
    cost: {
      type: Number,
      min: [0, 'Maintenance cost cannot be negative']
    },
    performedBy: {
      type: String,
      required: true,
      maxLength: [100, 'Performed by cannot exceed 100 characters']
    }
  }],
  notes: {
    type: String,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  depreciation: {
    method: {
      type: String,
      enum: ['straight-line', 'declining-balance', 'units-of-production'],
      default: 'straight-line'
    },
    usefulLife: {
      type: Number,
      min: [1, 'Useful life must be at least 1 year'],
      max: [50, 'Useful life cannot exceed 50 years']
    },
    salvageValue: {
      type: Number,
      min: [0, 'Salvage value cannot be negative'],
      default: 0
    }
  },
  warranty: {
    provider: String,
    startDate: Date,
    endDate: Date,
    coverage: String
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ location: 1 });
assetSchema.index({ assignedTo: 1 });

// Virtual for current asset value (considering depreciation)
assetSchema.virtual('currentValue').get(function() {
  if (!this.depreciation.usefulLife || !this.purchasePrice) {
    return this.purchasePrice;
  }
  
  const currentDate = new Date();
  const purchaseDate = new Date(this.purchaseDate);
  const yearsElapsed = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (this.depreciation.method === 'straight-line') {
    const annualDepreciation = (this.purchasePrice - this.depreciation.salvageValue) / this.depreciation.usefulLife;
    const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, this.purchasePrice - this.depreciation.salvageValue);
    return Math.max(this.purchasePrice - totalDepreciation, this.depreciation.salvageValue);
  }
  
  return this.purchasePrice; // Default fallback
});

// Virtual for maintenance status
assetSchema.virtual('maintenanceStatus').get(function() {
  if (!this.lastMaintenance) {
    return 'overdue';
  }
  
  const lastMaintenanceDate = new Date(this.lastMaintenance);
  const currentDate = new Date();
  const daysSinceLastMaintenance = (currentDate - lastMaintenanceDate) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastMaintenance > 180) {
    return 'overdue';
  } else if (daysSinceLastMaintenance > 150) {
    return 'due-soon';
  } else {
    return 'current';
  }
});

// Pre-save middleware to update lastMaintenance when maintenance history is added
assetSchema.pre('save', function(next) {
  if (this.maintenanceHistory && this.maintenanceHistory.length > 0) {
    const latestMaintenance = this.maintenanceHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    this.lastMaintenance = latestMaintenance.date;
  }
  next();
});

// Static method to get assets by status
assetSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to get assets due for maintenance
assetSchema.statics.findDueForMaintenance = function() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return this.find({
    $or: [
      { lastMaintenance: { $lt: sixMonthsAgo } },
      { lastMaintenance: { $exists: false } }
    ]
  });
};

// Instance method to add maintenance record
assetSchema.methods.addMaintenanceRecord = function(maintenanceData) {
  this.maintenanceHistory.push(maintenanceData);
  return this.save();
};

module.exports = mongoose.model('Asset', assetSchema);
