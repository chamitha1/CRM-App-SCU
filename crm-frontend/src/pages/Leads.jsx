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
  Chip,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as ConvertIcon
} from '@mui/icons-material';
import { leadAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    status: 'new',
    value: 0,
    priority: 'medium',
    notes: '',
    tags: [],
    assignedTo: null
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await leadAPI.getAll();
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Mock data for development
      setLeads([
        {
          id: 1,
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '(555) 111-2222',
          company: 'Johnson Builders',
          source: 'Website',
          status: 'new',
          notes: 'Interested in residential project',
          estimatedValue: 75000,
          createdAt: '2024-01-25'
        },
        {
          id: 2,
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          phone: '(555) 333-4444',
          company: 'Wilson Properties',
          source: 'Referral',
          status: 'contacted',
          notes: 'Commercial development project',
          estimatedValue: 200000,
          createdAt: '2024-01-22'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingLead(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      source: 'website',
      status: 'new',
      value: 0,
      priority: 'medium',
      notes: '',
      tags: [],
      assignedTo: null
    });
    setDialogOpen(true);
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    
    // Convert lead data to form format
    const mappedFormData = {
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source ? lead.source.toLowerCase() : 'website',
      status: lead.status || 'new',
      value: lead.value || lead.estimatedValue || 0,
      priority: lead.priority || 'medium',
      notes: lead.notes || '',
      tags: lead.tags || [],
      assignedTo: lead.assignedTo || null
    };
    
    setFormData(mappedFormData);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadAPI.delete(id);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleConvert = async (lead) => {
    if (window.confirm('Convert this lead to customer?')) {
      try {
        await leadAPI.convert(lead.id, {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company
        });
        toast.success('Lead converted to customer successfully');
        fetchLeads();
      } catch (error) {
        console.error('Error converting lead:', error);
        toast.error('Failed to convert lead');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingLead) {
        const leadId = editingLead._id || editingLead.id;
        await leadAPI.update(leadId, formData);
        toast.success('Lead updated successfully');
      } else {
        await leadAPI.create(formData);
        toast.success('Lead created successfully');
      }
      setDialogOpen(false);
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const fullName = lead.firstName && lead.lastName 
      ? `${lead.firstName} ${lead.lastName}`.toLowerCase()
      : (lead.name || '').toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'success';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <Spinner message="Loading leads..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lead Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add Lead
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search leads by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Paper>

      {/* Leads Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Estimated Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((lead) => (
                  <TableRow key={lead._id || lead.id}>
                    <TableCell>
                      {lead.firstName && lead.lastName 
                        ? `${lead.firstName} ${lead.lastName}` 
                        : lead.name || 'N/A'}
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>{lead.company || 'N/A'}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>${(lead.value || lead.estimatedValue || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={lead.status}
                        color={getStatusColor(lead.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Convert to Customer">
                        <IconButton onClick={() => handleConvert(lead)}>
                          <ConvertIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton onClick={() => handleEdit(lead)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(lead._id || lead.id)}>
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
          count={filteredLeads.length}
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
          {editingLead ? 'Edit Lead' : 'Add New Lead'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={formData.source}
                label="Source"
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <MenuItem value="website">Website</MenuItem>
                <MenuItem value="referral">Referral</MenuItem>
                <MenuItem value="advertisement">Advertisement</MenuItem>
                <MenuItem value="social_media">Social Media</MenuItem>
                <MenuItem value="cold_call">Cold Call</MenuItem>
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
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="proposal">Proposal</MenuItem>
                <MenuItem value="negotiation">Negotiation</MenuItem>
                <MenuItem value="closed_won">Closed Won</MenuItem>
                <MenuItem value="closed_lost">Closed Lost</MenuItem>
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
              label="Estimated Value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              fullWidth
            />
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
            {editingLead ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leads; 