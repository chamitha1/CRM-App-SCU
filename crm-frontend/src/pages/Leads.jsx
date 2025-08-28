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
  Tooltip,
  Grid,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as ConvertIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { leadAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Kanban columns mapping to backend statuses
  const columnOrder = ['new', 'contacted', 'negotiation', 'closed_won', 'closed_lost'];
  const columnLabels = {
    new: 'New',
    contacted: 'Contacted',
    negotiation: 'Negotiation',
    closed_won: 'Won',
    closed_lost: 'Lost'
  };

  // Map miscellaneous statuses into nearest column for display
  const normalizeStatusForBoard = (status) => {
    if (!status) return 'new';
    if (status === 'proposal' || status === 'qualified') return 'negotiation';
    return status;
  };

  const statusColor = (status) => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'negotiation': return 'secondary';
      case 'closed_won': return 'success';
      case 'closed_lost': return 'error';
      default: return 'default';
    }
  };

  const leadsByColumn = useMemo(() => {
    const groups = {
      new: [],
      contacted: [],
      negotiation: [],
      closed_won: [],
      closed_lost: []
    };
    filteredLeads.forEach((lead) => {
      const col = normalizeStatusForBoard(lead.status);
      if (groups[col]) groups[col].push(lead);
      else groups.new.push(lead);
    });
    return groups;
  }, [filteredLeads]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    if (sourceCol === destCol && destination.index === source.index) return;

    // Optimistic UI update
    const leadId = draggableId;
    const currentLead = leads.find(l => (l._id || String(l.id)) === leadId);
    if (!currentLead) return;
    const previousStatus = currentLead.status;
    const newStatus = destCol;

    try {
      setLeads(prev => prev.map(l => (l._id || String(l.id)) === leadId ? { ...l, status: newStatus } : l));
      await leadAPI.update(currentLead._id || currentLead.id, { status: newStatus });
      toast.success('Lead status updated');
    } catch (error) {
      // Revert on error
      setLeads(prev => prev.map(l => (l._id || String(l.id)) === leadId ? { ...l, status: previousStatus } : l));
      toast.error('Failed to update lead status');
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

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {columnOrder.map((colKey) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={colKey}>
              <Paper sx={{ p: 2, height: '70vh', display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6">{columnLabels[colKey]}</Typography>
                  <Chip label={leadsByColumn[colKey]?.length || 0} size="small" />
                </Box>
                <Divider />
                <Droppable droppableId={colKey}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        mt: 2,
                        flexGrow: 1,
                        overflowY: 'auto',
                        bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                        borderRadius: 1,
                        p: 0.5
                      }}
                    >
                      <Stack spacing={1.5}>
                        {(leadsByColumn[colKey] || []).map((lead, index) => {
                          const id = lead._id || String(lead.id);
                          const name = lead.firstName && lead.lastName ? `${lead.firstName} ${lead.lastName}` : (lead.name || 'N/A');
                          const value = lead.value || lead.estimatedValue || 0;
                          return (
                            <Draggable draggableId={id} index={index} key={id}>
                              {(dragProvided, dragSnapshot) => (
                                <Paper
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  elevation={dragSnapshot.isDragging ? 6 : 1}
                                  sx={{ p: 1.5, cursor: 'grab' }}
                                >
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="subtitle1" fontWeight={600} noWrap>{name}</Typography>
                                    <Chip label={columnLabels[normalizeStatusForBoard(lead.status)] || lead.status} color={statusColor(normalizeStatusForBoard(lead.status))} size="small" />
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" noWrap>{lead.company || '-'}</Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                    <Chip label={lead.source || 'unknown'} size="small" variant="outlined" />
                                    <Typography variant="caption" color="text.secondary">${value.toLocaleString()}</Typography>
                                  </Stack>
                                  <Stack direction="row" spacing={0.5} mt={1}>
                                    <Tooltip title="Convert to Customer">
                                      <IconButton size="small" onClick={() => handleConvert(lead)}>
                                        <ConvertIcon fontSize="inherit" />
                                      </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" onClick={() => handleEdit(lead)}>
                                      <EditIcon fontSize="inherit" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(lead._id || lead.id)}>
                                      <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                  </Stack>
                                </Paper>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </Stack>
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

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