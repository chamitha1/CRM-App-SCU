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
  Drawer,
  Tabs,
  Tab,
  Avatar,
  Grid,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { customerAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';
import GenerateReportButton from '../components/reports/GenerateReportButton';
import * as reportService from '../services/reportService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    status: 'active',
    tags: [],
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Mock data for development
      setCustomers([
        {
          _id: '689efb64bc573f7232a10ed6',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          company: 'Smith Construction',
          address: {
            street: '123 Main St',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            country: 'USA'
          },
          status: 'active',
          tags: ['VIP'],
          notes: 'Long-term client',
          createdAt: '2024-01-15'
        },
        {
          _id: '689efb64bc573f7232a10ed7',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '(555) 987-6543',
          company: 'Doe Enterprises',
          address: {
            street: '456 Oak Ave',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62702',
            country: 'USA'
          },
          status: 'pending',
          tags: ['New Client'],
          notes: 'Interested in commercial projects',
          createdAt: '2024-01-20'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      status: 'active',
      tags: [],
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    
    // Handle legacy data format where name might exist instead of firstName/lastName
    let firstName = customer.firstName || '';
    let lastName = customer.lastName || '';
    
    // If no firstName/lastName but there's a name field, try to split it
    if (!firstName && !lastName && customer.name) {
      const nameParts = customer.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Convert customer data to form format
    const mappedFormData = {
      firstName: firstName,
      lastName: lastName,
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      address: customer.address && typeof customer.address === 'object' ? 
        customer.address : {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
      status: customer.status || 'active',
      tags: customer.tags || [],
      notes: customer.notes || ''
    };
    
    setFormData(mappedFormData);
    setDialogOpen(true);
  };

  const openDrawer = (customer) => {
    setSelectedCustomer(customer);
    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedCustomer(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      }
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone is required');
      return;
    }
    
    try {
      if (editingCustomer) {
        const customerId = editingCustomer._id || editingCustomer.id;
        await customerAPI.update(customerId, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerAPI.create(formData);
        toast.success('Customer created successfully');
      }
      setDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = customer.firstName && customer.lastName 
      ? `${customer.firstName} ${customer.lastName}`.toLowerCase()
      : (customer.name || '').toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (customer.company || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'active': return 'inactive';
      case 'inactive': return 'pending';
      case 'pending': return 'active';
      default: return 'active';
    }
  };

  const handleStatusChange = async (customer, event) => {
    // Prevent triggering the row click event
    event.stopPropagation();
    
    const nextStatus = getNextStatus(customer.status);
    
    try {
      // Update the customer status via API
      const customerId = customer._id || customer.id;
      await customerAPI.update(customerId, { status: nextStatus });
      
      // Update the local state
      setCustomers(prevCustomers => 
        prevCustomers.map(c => 
          (c._id || c.id) === customerId 
            ? { ...c, status: nextStatus }
            : c
        )
      );
      
      // Update the selectedCustomer state if it matches the updated customer
      setSelectedCustomer(prevSelected => {
        if (prevSelected && (prevSelected._id || prevSelected.id) === customerId) {
          return { ...prevSelected, status: nextStatus };
        }
        return prevSelected;
      });
      
      toast.success(`Customer status updated to ${nextStatus}`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    }
  };

  const handleGenerateReport = async (reportParams) => {
    try {
      const data = await reportService.getModuleData('customers', reportParams);
      reportService.buildPdf('customers', data, reportParams);
    } catch (error) {
      console.error('Error generating customers report:', error);
      throw error;
    }
  };

  if (loading) {
    return <Spinner message="Loading customers..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Customers & Orders</Typography>
        <Stack direction="row" spacing={2}>
          <GenerateReportButton
            moduleKey="customers"
            moduleTitle="Customers & Orders"
            onGenerate={handleGenerateReport}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add Customer
          </Button>
        </Stack>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search customers by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Paper>

      {/* Customers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((customer) => (
                  <TableRow key={customer._id || customer.id} hover onClick={() => openDrawer(customer)} sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      {customer.firstName && customer.lastName 
                        ? `${customer.firstName} ${customer.lastName}` 
                        : customer.name || 'N/A'}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.company || 'N/A'}</TableCell>
                    <TableCell>
                      {customer.address ? (
                        typeof customer.address === 'string' 
                          ? customer.address
                          : `${customer.address.city || ''} ${customer.address.state || ''}`.trim() || 'N/A'
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Click to change status from ${customer.status} to ${getNextStatus(customer.status)}`}>
                        <Chip
                          label={customer.status}
                          color={getStatusColor(customer.status)}
                          size="small"
                          clickable
                          onClick={(e) => handleStatusChange(customer, e)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              transition: 'transform 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(customer._id || customer.id); }}>
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
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Side Drawer for Customer Details */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
      >
        {selectedCustomer && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>
                  {(selectedCustomer.firstName?.[0] || selectedCustomer.name?.[0] || '?').toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedCustomer.firstName && selectedCustomer.lastName
                      ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                      : selectedCustomer.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{selectedCustomer.company || '—'}</Typography>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <Tabs value={drawerTab} onChange={(e, v) => setDrawerTab(v)} variant="fullWidth">
              <Tab label="Details" />
              <Tab label="Activity" />
              <Tab label="Actions" />
            </Tabs>
            <Divider />
            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
              {drawerTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                    <Typography variant="body2">Email: {selectedCustomer.email}</Typography>
                    <Typography variant="body2">Phone: {selectedCustomer.phone || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body2">
                      {typeof selectedCustomer.address === 'string' && selectedCustomer.address}
                      {typeof selectedCustomer.address === 'object' && selectedCustomer.address ? (
                        `${selectedCustomer.address.street || ''} ${selectedCustomer.address.city || ''} ${selectedCustomer.address.state || ''} ${selectedCustomer.address.zipCode || ''} ${selectedCustomer.address.country || ''}`.trim() || '—'
                      ) : ''}
                      {!selectedCustomer.address && '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Status & Tags</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Tooltip title={`Click to change status from ${selectedCustomer.status} to ${getNextStatus(selectedCustomer.status)}`}>
                        <Chip 
                          size="small" 
                          label={selectedCustomer.status} 
                          color={getStatusColor(selectedCustomer.status)} 
                          clickable
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(selectedCustomer, e);
                          }}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              transition: 'transform 0.2s ease-in-out'
                            }
                          }}
                        />
                      </Tooltip>
                      {(selectedCustomer.tags || []).map((t) => (
                        <Chip key={t} size="small" label={t} variant="outlined" />
                      ))}
                    </Stack>
                  </Grid>
                  {selectedCustomer.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                      <Typography variant="body2">{selectedCustomer.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              )}

              {drawerTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Appointment and order timeline coming soon.
                  </Typography>
                </Box>
              )}

              {drawerTab === 2 && (
                <Stack spacing={1}>
                  <Tooltip title="Send email to customer">
                    <Button variant="outlined" component="a" href={`mailto:${selectedCustomer.email}`}>
                      Email
                    </Button>
                  </Tooltip>
                  <Button variant="outlined" onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedCustomer, null, 2));
                    const dl = document.createElement('a');
                    dl.setAttribute('href', dataStr);
                    dl.setAttribute('download', `${(selectedCustomer.firstName || selectedCustomer.name || 'customer')}.json`);
                    document.body.appendChild(dl);
                    dl.click();
                    dl.remove();
                  }}>
                    Download Details
                  </Button>
                  <Tooltip title="Open edit dialog">
                    <Button variant="contained" onClick={() => { setDrawerOpen(false); handleEdit(selectedCustomer); }}>
                      Edit Customer
                    </Button>
                  </Tooltip>
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="prospect">Prospect</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Street Address"
              value={formData.address.street}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              fullWidth
            />
            <TextField
              label="City"
              value={formData.address.city}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              fullWidth
            />
            <TextField
              label="State"
              value={formData.address.state}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
              fullWidth
            />
            <TextField
              label="Zip Code"
              value={formData.address.zipCode}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
              fullWidth
            />
            <TextField
              label="Country"
              value={formData.address.country}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers; 