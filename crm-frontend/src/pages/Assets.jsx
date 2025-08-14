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
import { assetAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'equipment',
    type: '',
    serialNumber: '',
    model: '',
    manufacturer: '',
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    condition: 'good',
    status: 'active',
    location: '',
    assignedTo: null,
    customerId: null,
    warrantyExpiry: '',
    maintenanceSchedule: {
      lastService: '',
      nextService: '',
      frequency: 'annually'
    },
    notes: '',
    tags: []
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await assetAPI.getAll();
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      // Mock data for development
      setAssets([
        {
          id: 1,
          name: 'Excavator CAT 320',
          type: 'Heavy Equipment',
          serialNumber: 'CAT320-2024-001',
          purchaseDate: '2024-01-10',
          purchasePrice: 150000,
          location: 'Site A',
          status: 'available',
          assignedTo: 'Mike Johnson',
          lastMaintenance: '2024-01-15'
        },
        {
          id: 2,
          name: 'Crane 50 Ton',
          type: 'Lifting Equipment',
          serialNumber: 'CRANE50-2023-005',
          purchaseDate: '2023-06-15',
          purchasePrice: 250000,
          location: 'Site B',
          status: 'in-use',
          assignedTo: 'John Smith',
          lastMaintenance: '2024-01-20'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAsset(null);
    setFormData({
      name: '',
      description: '',
      category: 'equipment',
      type: '',
      serialNumber: '',
      model: '',
      manufacturer: '',
      purchaseDate: '',
      purchasePrice: 0,
      currentValue: 0,
      condition: 'good',
      status: 'active',
      location: '',
      assignedTo: null,
      customerId: null,
      warrantyExpiry: '',
      maintenanceSchedule: {
        lastService: '',
        nextService: '',
        frequency: 'annually'
      },
      notes: '',
      tags: []
    });
    setDialogOpen(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    // Convert backend data to form format
    setFormData({
      name: asset.name || '',
      description: asset.description || '',
      category: asset.category || 'equipment',
      type: asset.type || '',
      serialNumber: asset.serialNumber || '',
      model: asset.model || '',
      manufacturer: asset.manufacturer || '',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.slice(0, 10) : '',
      purchasePrice: asset.purchasePrice || 0,
      currentValue: asset.currentValue || 0,
      condition: asset.condition || 'good',
      status: asset.status || 'active',
      location: asset.location || '',
      assignedTo: asset.assignedTo || null,
      customerId: asset.customerId || null,
      warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.slice(0, 10) : '',
      maintenanceSchedule: {
        lastService: asset.maintenanceSchedule?.lastService ? asset.maintenanceSchedule.lastService.slice(0, 10) : '',
        nextService: asset.maintenanceSchedule?.nextService ? asset.maintenanceSchedule.nextService.slice(0, 10) : '',
        frequency: asset.maintenanceSchedule?.frequency || 'annually'
      },
      notes: asset.notes || '',
      tags: asset.tags || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetAPI.delete(id);
        toast.success('Asset deleted successfully');
        fetchAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error('Failed to delete asset');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Asset name is required');
        return;
      }

      // Prepare asset data for backend
      const assetData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : undefined,
        category: formData.category,
        type: formData.type ? formData.type.trim() : undefined,
        serialNumber: formData.serialNumber ? formData.serialNumber.trim() : undefined,
        model: formData.model ? formData.model.trim() : undefined,
        manufacturer: formData.manufacturer ? formData.manufacturer.trim() : undefined,
        purchaseDate: formData.purchaseDate || undefined,
        purchasePrice: formData.purchasePrice,
        currentValue: formData.currentValue,
        condition: formData.condition,
        status: formData.status,
        location: formData.location ? formData.location.trim() : undefined,
        assignedTo: formData.assignedTo || undefined,
        customerId: formData.customerId || undefined,
        warrantyExpiry: formData.warrantyExpiry || undefined,
        maintenanceSchedule: {
          lastService: formData.maintenanceSchedule?.lastService || undefined,
          nextService: formData.maintenanceSchedule?.nextService || undefined,
          frequency: formData.maintenanceSchedule?.frequency || 'annually'
        },
        notes: formData.notes ? formData.notes.trim() : undefined,
        tags: formData.tags
      };

      // Remove undefined fields to avoid sending them
      Object.keys(assetData).forEach(key => {
        if (assetData[key] === undefined) {
          delete assetData[key];
        }
      });

      // Clean maintenance schedule
      if (assetData.maintenanceSchedule) {
        Object.keys(assetData.maintenanceSchedule).forEach(key => {
          if (assetData.maintenanceSchedule[key] === undefined) {
            delete assetData.maintenanceSchedule[key];
          }
        });
        // Remove empty maintenance schedule
        if (Object.keys(assetData.maintenanceSchedule).length === 0) {
          delete assetData.maintenanceSchedule;
        }
      }

      console.log('Sending asset data:', assetData);

      if (editingAsset) {
        await assetAPI.update(editingAsset._id || editingAsset.id, assetData);
        toast.success('Asset updated successfully');
      } else {
        await assetAPI.create(assetData);
        toast.success('Asset created successfully');
      }
      setDialogOpen(false);
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
      if (error.response?.data?.message) {
        toast.error(`Failed to save asset: ${error.response.data.message}`);
      } else {
        toast.error('Failed to save asset');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'in-use': return 'info';
      case 'maintenance': return 'warning';
      case 'out-of-service': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <Spinner message="Loading assets..." />;
  }

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Asset Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add Asset
        </Button>
      </Box>

      {/* Authentication Status Alert */}
      {!isAuthenticated && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Authentication Required</AlertTitle>
          You need to log in to create, edit, or delete assets. Currently displaying sample data.
          <br />
          Test credentials: email: <strong>test@example.com</strong>, password: <strong>testpassword</strong>
        </Alert>
      )}

      {/* Assets Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Purchase Date</TableCell>
                <TableCell>Purchase Price</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((asset) => (
                  <TableRow key={asset._id || asset.id}>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.category || asset.type}</TableCell>
                    <TableCell>{asset.serialNumber || '-'}</TableCell>
                    <TableCell>
                      {asset.purchaseDate 
                        ? new Date(asset.purchaseDate).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {asset.purchasePrice 
                        ? `$${asset.purchasePrice.toLocaleString()}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{asset.location || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={asset.status}
                        color={getStatusColor(asset.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {asset.assignedTo?.name || asset.assignedTo || '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(asset)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(asset._id || asset.id)}>
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
          count={assets.length}
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
          {editingAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              label="Asset Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="vehicle">Vehicle</MenuItem>
                <MenuItem value="property">Property</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="furniture">Furniture</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
            />
            <TextField
              label="Serial Number"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              fullWidth
            />
            <TextField
              label="Manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              fullWidth
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Purchase Price"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
              fullWidth
            />
            <TextField
              label="Current Value"
              type="number"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                value={formData.condition}
                label="Condition"
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
                <MenuItem value="damaged">Damaged</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Service Date"
              type="date"
              value={formData.maintenanceSchedule?.lastService || ''}
              onChange={(e) => setFormData({
                ...formData,
                maintenanceSchedule: {
                  ...formData.maintenanceSchedule,
                  lastService: e.target.value
                }
              })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Next Service Date"
              type="date"
              value={formData.maintenanceSchedule?.nextService || ''}
              onChange={(e) => setFormData({
                ...formData,
                maintenanceSchedule: {
                  ...formData.maintenanceSchedule,
                  nextService: e.target.value
                }
              })}
              fullWidth
              InputLabelProps={{ shrink: true }}
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
            {editingAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assets; 