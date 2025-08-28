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
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  Tooltip,
  Stack,
  Divider,
  Drawer,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
import { assetAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import { toast } from 'react-toastify';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [drawerTab, setDrawerTab] = useState(0);
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
    tags: [],
    images: []
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
          status: 'active',
          assignedTo: 'Mike Johnson',
          lastMaintenance: '2024-01-15',
          images: ['https://via.placeholder.com/300x200?text=Excavator+CAT+320']
        },
        {
          id: 2,
          name: 'Crane 50 Ton',
          type: 'Lifting Equipment',
          serialNumber: 'CRANE50-2023-005',
          purchaseDate: '2023-06-15',
          purchasePrice: 250000,
          location: 'Site B',
          status: 'maintenance',
          assignedTo: 'John Smith',
          lastMaintenance: '2024-01-20',
          images: ['https://via.placeholder.com/300x200?text=Crane+50+Ton']
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
      tags: [],
      images: []
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
      tags: asset.tags || [],
      images: asset.images || []
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

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const openAssetDrawer = (asset) => {
    setSelectedAsset(asset);
    setDrawerTab(0);
    setDrawerOpen(true);
  };

  const closeAssetDrawer = () => {
    setDrawerOpen(false);
    setSelectedAsset(null);
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
        tags: formData.tags,
        images: formData.images.map(img => img.url || img)
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
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      case 'retired': return 'info';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesSearch = [a.name, a.description, a.serialNumber, a.location, a.type, a.model, a.manufacturer]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [assets, searchTerm, statusFilter, categoryFilter]);

  // Assign feature removed

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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search assets by name, serial, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="vehicle">Vehicle</MenuItem>
                <MenuItem value="property">Property</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="furniture">Furniture</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Card Grid */}
      <Grid container spacing={2}>
        {filteredAssets.map((asset) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={asset._id || asset.id}>
            <Card>
              <CardHeader
                avatar={<Avatar>{(asset.name || '?').charAt(0).toUpperCase()}</Avatar>}
                title={asset.name}
                subheader={asset.category || asset.type}
              />
              <Divider />
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Chip label={asset.status} color={getStatusColor(asset.status)} size="small" />
                  {asset.serialNumber && (
                    <Chip label={asset.serialNumber} size="small" variant="outlined" />
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Location: {asset.location || '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Purchase: {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}
                </Typography>
                {typeof asset.purchasePrice === 'number' && asset.purchasePrice > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Price: ${asset.purchasePrice.toLocaleString()}
                  </Typography>
                )}
                {/* Assigned info removed with assign feature */}
              </CardContent>
              <CardActions>
                <Tooltip title="View Details">
                  <IconButton onClick={() => openAssetDrawer(asset)}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                {/* Assign feature removed */}
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleEdit(asset)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDelete(asset._id || asset.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {filteredAssets.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No assets found.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Asset Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeAssetDrawer}
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
        {selectedAsset && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 56, height: 56 }}>
                  {(selectedAsset.name || '?').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedAsset.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAsset.category || selectedAsset.type || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <Tabs value={drawerTab} onChange={(e, v) => setDrawerTab(v)} variant="fullWidth">
              <Tab label="Details" />
              <Tab label="Images" />
              <Tab label="Maintenance" />
            </Tabs>
            <Divider />
            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
              {drawerTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
                    <Typography variant="body2">Name: {selectedAsset.name}</Typography>
                    <Typography variant="body2">Description: {selectedAsset.description || '—'}</Typography>
                    <Typography variant="body2">Category: {selectedAsset.category || '—'}</Typography>
                    <Typography variant="body2">Type: {selectedAsset.type || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Technical Details</Typography>
                    <Typography variant="body2">Serial Number: {selectedAsset.serialNumber || '—'}</Typography>
                    <Typography variant="body2">Model: {selectedAsset.model || '—'}</Typography>
                    <Typography variant="body2">Manufacturer: {selectedAsset.manufacturer || '—'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Financial</Typography>
                    <Typography variant="body2">
                      Purchase Date: {selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString() : '—'}
                    </Typography>
                    <Typography variant="body2">
                      Purchase Price: {selectedAsset.purchasePrice ? `$${selectedAsset.purchasePrice.toLocaleString()}` : '—'}
                    </Typography>
                    <Typography variant="body2">
                      Current Value: {selectedAsset.currentValue ? `$${selectedAsset.currentValue.toLocaleString()}` : '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Status & Location</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={selectedAsset.status} color={getStatusColor(selectedAsset.status)} size="small" />
                      <Chip label={selectedAsset.condition || '—'} size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="body2">Location: {selectedAsset.location || '—'}</Typography>
                    {/* Assigned info removed with assign feature */}
                  </Grid>
                  {selectedAsset.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                      <Typography variant="body2">{selectedAsset.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              )}

              {drawerTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Asset Images
                  </Typography>
                  {selectedAsset.images && selectedAsset.images.length > 0 ? (
                    <ImageList cols={2} rowHeight={200}>
                      {selectedAsset.images.map((image, index) => (
                        <ImageListItem key={index}>
                          <img
                            src={typeof image === 'string' ? image : image.url}
                            alt={`${selectedAsset.name} ${index + 1}`}
                            loading="lazy"
                            style={{ objectFit: 'cover', height: '100%' }}
                          />
                          <ImageListItemBar
                            title={`Image ${index + 1}`}
                            subtitle={typeof image === 'string' ? '' : image.name}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No images available for this asset.
                    </Typography>
                  )}
                </Box>
              )}

              {drawerTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Maintenance Schedule
                  </Typography>
                  <Typography variant="body2">
                    Last Service: {selectedAsset.maintenanceSchedule?.lastService 
                      ? new Date(selectedAsset.maintenanceSchedule.lastService).toLocaleDateString() 
                      : '—'}
                  </Typography>
                  <Typography variant="body2">
                    Next Service: {selectedAsset.maintenanceSchedule?.nextService 
                      ? new Date(selectedAsset.maintenanceSchedule.nextService).toLocaleDateString() 
                      : '—'}
                  </Typography>
                  <Typography variant="body2">
                    Frequency: {selectedAsset.maintenanceSchedule?.frequency || '—'}
                  </Typography>
                  {selectedAsset.warrantyExpiry && (
                    <Typography variant="body2">
                      Warranty Expiry: {new Date(selectedAsset.warrantyExpiry).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Drawer>

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
            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography variant="subtitle2" gutterBottom>
                Asset Images
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="asset-image-upload"
                multiple
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="asset-image-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoIcon />}>
                  Upload Images
                </Button>
              </label>
              {formData.images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Uploaded Images:
                  </Typography>
                  <Grid container spacing={1}>
                    {formData.images.map((image, index) => (
                      <Grid item key={index}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={image.url || image}
                            alt={`Preview ${index + 1}`}
                            style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <IconButton
                            size="small"
                            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}
                            onClick={() => removeImage(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign feature removed */}
    </Box>
  );
};

export default Assets; 