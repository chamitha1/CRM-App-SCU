const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { 
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
    required: true,
    enum: ['Profit Loss', 'Revenue', 'Tax', 'Project Docs', 'Client Docs', 'HR/Employee Docs', 'Miscellaneous']
  },
  tags: [{ 
    type: String,
    trim: true 
  }],
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  fileType: { 
    type: String, 
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  version: { 
    type: Number, 
    default: 1 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastModified: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for better search performance
documentSchema.index({ title: 'text', description: 'text', tags: 'text', category: 1 });
documentSchema.index({ uploadedBy: 1, uploadedAt: -1 });
documentSchema.index({ category: 1, uploadedAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
