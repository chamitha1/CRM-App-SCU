import React, { useState, useEffect } from 'react';
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
  IconButton,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { documentsAPI } from '../../services/api';

const DocumentEditModal = ({ open, document, onClose, onSuccess, categories }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateFile, setUpdateFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (document && open) {
      setFormData({
        title: document.title || '',
        description: document.description || '',
        category: document.category || '',
        tags: document.tags || []
      });
      setUpdateFile(false);
      setSelectedFile(null);
      setError('');
    }
  }, [document, open]);

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
    if (!formData.title.trim()) {
      setError('Please enter a document title.');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    if (updateFile && !selectedFile) {
      setError('Please select a new file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (updateFile && selectedFile) {
        // Update both metadata and file
        const formDataToSend = new FormData();
        formDataToSend.append('document', selectedFile);
        
        await documentsAPI.updateDocumentFile(document._id, formDataToSend);
      }
      
      // Update metadata
      await documentsAPI.updateDocument(document._id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags
      });
      
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating document. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!document) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          <EditIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Edit Document</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Current Document Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#6b7280' }}>
            Current Document
          </Typography>
          <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h4" sx={{ mr: 1 }}>
              {getFileIcon(document.fileName)}
            </Typography>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {document.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(document.fileSize)} • Version {document.version}
              </Typography>
            </Box>
          </Box>
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
        <Box sx={{ mb: 3 }}>
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

        <Divider sx={{ my: 2 }} />

        {/* File Update Section */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={updateFile}
                onChange={(e) => setUpdateFile(e.target.checked)}
                color="primary"
              />
            }
            label="Update document file"
          />
          
          {updateFile && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#92400e' }}>
                ⚠️ Updating the file will create a new version and replace the current file.
              </Typography>
              
              <Box
                sx={{
                  border: '2px dashed #f59e0b',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('file-input-edit').click()}
              >
                <input
                  id="file-input-edit"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                />
                
                {selectedFile ? (
                  <Box>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      {getFileIcon(selectedFile.name)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: '#1f2937' }}>
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
                    <UploadIcon sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
                    <Typography variant="body2" color="#92400e">
                      Click to select new file
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Updating document...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title.trim() || !formData.category || (updateFile && !selectedFile)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          {loading ? 'Updating...' : 'Update Document'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentEditModal;
