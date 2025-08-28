import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { appointmentAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';
import {
  Calendar,
  dateFnsLocalizer
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    type: 'meeting',
    status: 'scheduled',
    priority: 'medium',
    notes: '',
    attendees: [],
    customerId: null,
    leadId: null
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to access appointments');
        // User will be redirected to login by the API interceptor
        return;
      }
      // Mock data for development when not authenticated
      setAppointments([
        {
          id: 1,
          title: 'Site Inspection',
          customerName: 'John Smith',
          date: '2024-02-15',
          time: '10:00',
          duration: '2 hours',
          type: 'Site Visit',
          notes: 'Residential project inspection',
          status: 'scheduled'
        },
        {
          id: 2,
          title: 'Contract Discussion',
          customerName: 'Jane Doe',
          date: '2024-02-16',
          time: '14:30',
          duration: '1 hour',
          type: 'Meeting',
          notes: 'Commercial project contract review',
          status: 'confirmed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAppointment(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      type: 'meeting',
      status: 'scheduled',
      priority: 'medium',
      notes: '',
      attendees: [],
      customerId: null,
      leadId: null
    });
    setDialogOpen(true);
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    // Convert backend data to form format
    setFormData({
      title: appointment.title || '',
      description: appointment.description || '',
      startDate: appointment.startDate ? appointment.startDate.slice(0, 16) : '',
      endDate: appointment.endDate ? appointment.endDate.slice(0, 16) : '',
      location: appointment.location || '',
      type: appointment.type || 'meeting',
      status: appointment.status || 'scheduled',
      priority: appointment.priority || 'medium',
      notes: appointment.notes || '',
      attendees: appointment.attendees || [],
      customerId: appointment.customerId || null,
      leadId: appointment.leadId || null
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentAPI.delete(id);
        toast.success('Appointment deleted successfully');
        fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }
      if (!formData.startDate) {
        toast.error('Start date and time is required');
        return;
      }
      if (!formData.endDate) {
        toast.error('End date and time is required');
        return;
      }
      
      // Check if end date is after start date
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        toast.error('End date must be after start date');
        return;
      }

      // Prepare the appointment data for backend
      const appointmentData = {
        title: formData.title.trim(),
        description: formData.description ? formData.description.trim() : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        location: formData.location ? formData.location.trim() : undefined,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes ? formData.notes.trim() : undefined,
        attendees: formData.attendees,
        customerId: formData.customerId || undefined,
        leadId: formData.leadId || undefined
      };

      // Remove undefined fields to avoid sending them
      Object.keys(appointmentData).forEach(key => {
        if (appointmentData[key] === undefined) {
          delete appointmentData[key];
        }
      });

      console.log('Sending appointment data:', appointmentData);

      if (editingAppointment) {
        await appointmentAPI.update(editingAppointment._id || editingAppointment.id, appointmentData);
        toast.success('Appointment updated successfully');
      } else {
        await appointmentAPI.create(appointmentData);
        toast.success('Appointment created successfully');
      }
      setDialogOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      if (error.response?.data?.message) {
        toast.error(`Failed to save appointment: ${error.response.data.message}`);
      } else {
        toast.error('Failed to save appointment');
      }
    }
  };

  // Calendar localizer
  const locales = {};
  const localizer = useMemo(() => dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
  }), []);

  // Transform appointments into calendar events
  const events = useMemo(() => {
    return appointments.map((a) => ({
      id: a._id || a.id,
      title: a.title,
      start: a.startDate ? new Date(a.startDate) : (a.date ? new Date(a.date) : new Date()),
      end: a.endDate ? new Date(a.endDate) : (a.time ? new Date(a.time) : new Date()),
      resource: a
    }));
  }, [appointments]);

  const eventPropGetter = (event) => {
    const now = new Date();
    const status = event.resource?.status || 'scheduled';
    let backgroundColor = '#4caf50'; // upcoming = green
    if (status === 'completed') backgroundColor = '#2196f3'; // blue
    else if (status === 'cancelled') backgroundColor = '#9e9e9e'; // grey
    else if (event.end < now && status !== 'completed') backgroundColor = '#f44336'; // missed = red
    return {
      style: {
        backgroundColor,
        borderRadius: 6,
        opacity: 0.9,
        color: '#fff',
        border: 'none'
      }
    };
  };

  const handleSelectEvent = (event) => {
    const appointment = event.resource;
    handleEdit(appointment);
  };

  const handleSelectSlot = ({ start, end }) => {
    setEditingAppointment(null);
    setFormData((prev) => ({
      ...prev,
      title: '',
      description: '',
      startDate: start ? new Date(start).toISOString().slice(0, 16) : '',
      endDate: end ? new Date(end).toISOString().slice(0, 16) : '',
      location: '',
      type: 'meeting',
      status: 'scheduled',
      priority: 'medium',
      notes: '',
      attendees: [],
      customerId: null,
      leadId: null
    }));
    setDialogOpen(true);
  };

  if (loading) {
    return <Spinner message="Loading appointments..." />;
  }

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Appointment Scheduling</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Schedule Appointment
        </Button>
      </Box>

      {/* Authentication Status Alert */}
      {!isAuthenticated && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Authentication Required</AlertTitle>
          You need to log in to create, edit, or delete appointments. Currently displaying sample data.
          <br />
          Test credentials: email: <strong>test@example.com</strong>, password: <strong>testpassword</strong>
        </Alert>
      )}

      {/* Calendar View */}
      <Paper sx={{ p: 1 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '70vh' }}
          views={['month', 'week']}
          defaultView="month"
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventPropGetter}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
            />
            <TextField
              label="Start Date & Time"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date & Time"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="call">Call</MenuItem>
                <MenuItem value="presentation">Presentation</MenuItem>
                <MenuItem value="follow_up">Follow Up</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="rescheduled">Rescheduled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAppointment ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments; 