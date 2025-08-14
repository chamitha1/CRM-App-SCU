const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  customerName: { 
    type: String, 
    required: true,
    trim: true
  },
  date: { 
    type: Date, 
    required: true
  },
  time: { 
    type: String, 
    required: true
  },
  duration: { 
    type: String, 
    required: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['Meeting', 'Site Visit', 'Consultation', 'Follow-up']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: { 
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
