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
  AlertTitle,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Tooltip,
  Drawer,
  Stack,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { employeeAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';
import GenerateReportButton from '../components/reports/GenerateReportButton';
import { getModuleData, buildPdf } from '../services/reportService';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    hireDate: '',
    salary: '',
    status: 'active'
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [drawerTab, setDrawerTab] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Listen for profile updates to refresh list if needed
  useEffect(() => {
    const onProfileUpdated = () => {
      fetchEmployees();
    };
    window.addEventListener('profileUpdated', onProfileUpdated);
    return () => window.removeEventListener('profileUpdated', onProfileUpdated);
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...');
      const response = await employeeAPI.getAll();
      console.log('Employees response:', response);
      console.log('Employees data:', response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      console.log('Error response:', error.response);
      
      if (error.response?.status === 401) {
        // Authentication error
        setEmployees([]);
        console.log('Authentication required to fetch employees');
      } else {
        // Other errors - show empty list and let user know
        setEmployees([]);
        toast.error('Failed to load employees. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      hireDate: '',
      salary: '',
      status: 'active'
    });
    setDialogOpen(true);
  };

  const handleGenerateReport = async (reportParams) => {
    try {
      const data = await getModuleData('employees', reportParams);
      buildPdf('employees', data, reportParams);
    } catch (error) {
      console.error('Error generating employees report:', error);
      toast.error('Failed to generate employees report');
      throw error; // Re-throw to let GenerateReportButton handle it
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    // Convert backend data to form format
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || 'employee',
      department: employee.department || '',
      hireDate: employee.hireDate ? employee.hireDate.slice(0, 10) : '',
      salary: employee.salary || '',
      status: employee.status || 'active'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        if (error.response?.data?.message) {
          toast.error(`Failed to delete employee: ${error.response.data.message}`);
        } else {
          toast.error('Failed to delete employee');
        }
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Employee name is required');
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Email is required');
        return;
      }

      // Prepare employee data for backend
      const employeeData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : undefined,
        role: formData.role,
        department: formData.department ? formData.department.trim() : undefined,
        hireDate: formData.hireDate || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        status: formData.status
      };

      // Remove undefined fields
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] === undefined) {
          delete employeeData[key];
        }
      });

      console.log('Sending employee data:', employeeData);

      let result;
      if (editingEmployee) {
        console.log('Updating employee with ID:', editingEmployee._id || editingEmployee.id);
        result = await employeeAPI.update(editingEmployee._id || editingEmployee.id, employeeData);
        console.log('Update result:', result);
        toast.success('Employee updated successfully');
      } else {
        console.log('Creating new employee...');
        result = await employeeAPI.create(employeeData);
        console.log('Create result:', result);
        toast.success('Employee created successfully');
      }
      setDialogOpen(false);
      console.log('Refreshing employee list...');
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      if (error.response?.data?.message) {
        toast.error(`Failed to save employee: ${error.response.data.message}`);
      } else {
        toast.error('Failed to save employee');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'employee': return 'info';
      default: return 'default';
    }
  };

  const openEmployeeDrawer = (employee) => {
    setSelectedEmployee(employee);
    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const closeEmployeeDrawer = () => {
    setDrawerOpen(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch = [e.name, e.email, e.phone, e.department]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'all' || e.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, roleFilter, statusFilter]);

  if (loading) {
    return <Spinner message="Loading employees..." />;
  }

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Employee Management</Typography>
        <Box display="flex" gap={2}>
          <GenerateReportButton
            moduleKey="employees"
            moduleTitle="Employees"
            onGenerate={handleGenerateReport}
            size="medium"
            variant="outlined"
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Authentication Status Alert */}
      {!isAuthenticated && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Authentication Required</AlertTitle>
          You need to log in to view, create, edit, or delete employees.
          <br />
          Test credentials: email: <strong>test@example.com</strong>, password: <strong>testpassword</strong>
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, email, phone, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Card Grid */}
      <Grid container spacing={2}>
        {filteredEmployees.map((employee) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={employee._id || employee.id}>
            <Card>
              <CardHeader
                avatar={<Avatar>{(employee.name || '?').charAt(0).toUpperCase()}</Avatar>}
                title={employee.name}
                subheader={employee.department || '—'}
              />
              <CardContent>
                <Typography variant="body2">Email: {employee.email}</Typography>
                <Typography variant="body2">Phone: {employee.phone || '—'}</Typography>
                <Typography variant="body2">Role: {employee.role}</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">Status:</Typography>
                  <Chip size="small" label={employee.status} color={getStatusColor(employee.status)} />
                </Box>
              </CardContent>
              <CardActions>
                <Tooltip title="View Details">
                  <IconButton onClick={() => openEmployeeDrawer(employee)}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleEdit(employee)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDelete(employee._id || employee.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {filteredEmployees.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No employees found.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
            />
            <TextField
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
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
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Employee Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeEmployeeDrawer}
        PaperProps={{ 
          sx: { 
            width: { xs: '100%', sm: 500 },
            zIndex: 1200,
            marginTop: { xs: 0, sm: '64px' },
            height: { xs: '100%', sm: 'calc(100% - 64px)' }
          } 
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { xs: '100%', sm: 500 }
          }
        }}
      >
        {selectedEmployee && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56 }}>
                  {(selectedEmployee.name || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedEmployee.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEmployee.role} • {selectedEmployee.department || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <Tabs value={drawerTab} onChange={(e, v) => setDrawerTab(v)} variant="fullWidth">
              <Tab label="Details" />
              <Tab label="Performance" />
              <Tab label="Tasks" />
            </Tabs>
            <Divider />
            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
              {drawerTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Personal Information</Typography>
                    <Typography variant="body2">Name: {selectedEmployee.name}</Typography>
                    <Typography variant="body2">Email: {selectedEmployee.email}</Typography>
                    <Typography variant="body2">Phone: {selectedEmployee.phone || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Employment Details</Typography>
                    <Typography variant="body2">Role: {selectedEmployee.role}</Typography>
                    <Typography variant="body2">Department: {selectedEmployee.department || '—'}</Typography>
                    <Typography variant="body2">
                      Hire Date: {selectedEmployee.hireDate ? new Date(selectedEmployee.hireDate).toLocaleDateString() : '—'}
                    </Typography>
                    <Typography variant="body2">
                      Salary: {selectedEmployee.salary ? `$${selectedEmployee.salary.toLocaleString()}` : '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={selectedEmployee.status} color={getStatusColor(selectedEmployee.status)} size="small" />
                      <Chip label={selectedEmployee.role} color={getRoleColor(selectedEmployee.role)} size="small" />
                    </Stack>
                  </Grid>
                  {selectedEmployee.address && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                      <Typography variant="body2">{selectedEmployee.address}</Typography>
                    </Grid>
                  )}
                  {selectedEmployee.emergencyContact && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Emergency Contact</Typography>
                      <Typography variant="body2">{selectedEmployee.emergencyContact}</Typography>
                    </Grid>
                  )}
                  {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Skills</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedEmployee.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Grid>
                  )}
                  {selectedEmployee.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                      <Typography variant="body2">{selectedEmployee.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              )}

              {drawerTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance tracking features will be implemented here.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This could include KPIs, reviews, and metrics.
                  </Typography>
                </Box>
              )}

              {drawerTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Assigned Tasks
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Task management features will be implemented here.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This could include current assignments and project involvement.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default Employees; 