import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { documentsAPI } from '../../services/api';

const DocumentUploadModal = ({ open, onClose, onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only PDF, Word, Excel, Images, and Text files are allowed.');
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB.');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Please enter a document title.');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('document', selectedFile);
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags.join(','));

      await documentsAPI.uploadDocument(formDataToSend);
      onSuccess();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: []
    });
    setSelectedFile(null);
    setNewTag('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'txt':
        return '📄';
      default:
        return '📎';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        pb: 2
      }}>
        <Box display="flex" alignItems="center">
          <UploadIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Upload Document</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* File Upload Area */}
        <Box
          sx={{
            border: `2px dashed ${dragActive ? '#6366f1' : '#e5e7eb'}`,
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: dragActive ? '#f8fafc' : '#ffffff',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            mb: 3
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
          />
          
          {selectedFile ? (
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {getFileIcon(selectedFile.name)}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, color: '#1f2937' }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
              >
                Change File
              </Button>
            </Box>
          ) : (
            <Box>
              <UploadIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#6b7280' }}>
                Drop your file here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports PDF, Word, Excel, Images, and Text files (Max: 50MB)
              </Typography>
            </Box>
          )}
        </Box>

        {/* Form Fields */}
        <TextField
          fullWidth
          label="Document Title *"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Enter document title"
        />

        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 2 }}
          placeholder="Enter document description (optional)"
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category *</InputLabel>
          <Select
            value={formData.category}
            label="Category *"
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tags */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Tags
          </Typography>
          <Box display="flex" gap={1} sx={{ mb: 1 }}>
            <TextField
              size="small"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddTag}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>
          {formData.tags.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                    color: '#3730a3'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Uploading document...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !selectedFile || !formData.title.trim() || !formData.category}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUploadModal;
