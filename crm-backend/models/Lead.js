const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    required: true,
    enum: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'contacted', 'qualified', 'lost'],
    default: 'new'
  },
  estimatedValue: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastContactDate: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: 'text', company: 'text', email: 'text' });

// Virtual for formatted estimated value
leadSchema.virtual('formattedEstimatedValue').get(function() {
  return this.estimatedValue ? `$${this.estimatedValue.toLocaleString()}` : '$0';
});

// Method to update status
leadSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'contacted') {
    this.lastContactDate = new Date();
  }
  return this.save();
};

// Static method to find leads by status
leadSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to get leads summary
leadSchema.statics.getLeadsSummary = async function() {
  const summary = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$estimatedValue' }
      }
    }
  ]);
  
  return summary;
};

module.exports = mongoose.model('Lead', leadSchema);
