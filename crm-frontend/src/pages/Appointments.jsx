import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { appointmentAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    customerName: '',
    date: '',
    time: '',
    duration: '',
    type: '',
    notes: '',
    status: 'scheduled'
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
      // Mock data for development
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
      customerName: '',
      date: '',
      time: '',
      duration: '',
      type: '',
      notes: '',
      status: 'scheduled'
    });
    setDialogOpen(true);
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData(appointment);
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
      if (editingAppointment) {
        await appointmentAPI.update(editingAppointment.id, formData);
        toast.success('Appointment updated successfully');
      } else {
        await appointmentAPI.create(formData);
        toast.success('Appointment created successfully');
      }
      setDialogOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <Spinner message="Loading appointments..." />;
  }

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

      {/* Appointments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.title}</TableCell>
                    <TableCell>{appointment.customerName}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.duration}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={appointment.status}
                        color={getStatusColor(appointment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(appointment)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(appointment.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={appointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
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
            />
            <TextField
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="Meeting">Meeting</MenuItem>
                <MenuItem value="Site Visit">Site Visit</MenuItem>
                <MenuItem value="Consultation">Consultation</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
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
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
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