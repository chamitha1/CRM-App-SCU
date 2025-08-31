const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all appointments with optional date filtering
router.get('/', auth, async (req, res) => {
  try {
    const { from, to, allTime } = req.query;
    let query = {};
    
    // Apply date filtering if not allTime - filter by appointment date (startDate)
    if (!allTime && from && to) {
      const startOfDay = new Date(from);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(to);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      query.startDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    const appointments = await Appointment.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .populate('leadId', 'firstName lastName email')
      .sort({ startDate: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .populate('leadId', 'firstName lastName email');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    // Set default assignedTo to current user if not provided
    const appointmentData = {
      ...req.body,
      createdBy: req.user.id,
      assignedTo: req.body.assignedTo || req.user.id
    };

    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();
    
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .populate('leadId', 'firstName lastName email');
    
    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .populate('leadId', 'firstName lastName email');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by date range
router.get('/range/:startDate/:endDate', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const appointments = await Appointment.find({
      startDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('customerId', 'firstName lastName email')
      .populate('leadId', 'firstName lastName email')
      .sort({ startDate: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
