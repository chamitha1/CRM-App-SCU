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
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { employeeAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  useEffect(() => {
    fetchEmployees();
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

  if (loading) {
    return <Spinner message="Loading employees..." />;
  }

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Employee Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add Employee
        </Button>
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

      {/* Employees Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Hire Date</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <TableRow key={employee._id || employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.role}
                        color={getRoleColor(employee.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{employee.department || '-'}</TableCell>
                    <TableCell>
                      {employee.hireDate 
                        ? new Date(employee.hireDate).toLocaleDateString() 
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {employee.salary 
                        ? `$${employee.salary.toLocaleString()}` 
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status}
                        color={getStatusColor(employee.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(employee)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(employee._id || employee.id)}>
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
          count={employees.length}
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
    </Box>
  );
};

export default Employees; 