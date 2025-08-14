const express = require('express');
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');
const router = express.Router();

// Middleware to verify JWT token
const auth = (req, res, next) => {
  // Bypass auth for testing
  next();
};

// GET all appointments
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ date: 1, time: 1 });
    
    // Transform _id to id for frontend compatibility
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      _id: appointment._id,
      title: appointment.title,
      customerName: appointment.customerName,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));
    
    res.json(transformedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { title, customerName, date, time, duration, type, notes, status } = req.body;

    // Validate required fields
    if (!title || !customerName || !date || !time || !duration || !type) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: title, customerName, date, time, duration, type' 
      });
    }

    const appointment = new Appointment({
      title,
      customerName,
      date,
      time,
      duration,
      type,
      status: status || 'scheduled',
      notes
    });

    await appointment.save();
    
    // Transform response to include id field
    const response = {
      id: appointment._id,
      _id: appointment._id,
      title: appointment.title,
      customerName: appointment.customerName,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, customerName, date, time, duration, type, notes, status } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Update fields if provided
    if (title !== undefined) appointment.title = title;
    if (customerName !== undefined) appointment.customerName = customerName;
    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    if (duration !== undefined) appointment.duration = duration;
    if (type !== undefined) appointment.type = type;
    if (status !== undefined) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();
    
    // Transform response to include id field
    const response = {
      id: appointment._id,
      _id: appointment._id,
      title: appointment.title,
      customerName: appointment.customerName,
      date: appointment.date,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET appointments by date range
router.get('/date-range/:startDate/:endDate', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    const appointments = await Appointment.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('createdBy', 'name email')
    .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by date range:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET appointments by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    
    const appointments = await Appointment.find({ status })
      .populate('createdBy', 'name email')
      .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
