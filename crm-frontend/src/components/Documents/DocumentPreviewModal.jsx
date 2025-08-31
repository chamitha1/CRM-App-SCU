import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
  Grid,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  Tag as TagIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { documentsAPI } from '../../services/api';

const DocumentPreviewModal = ({ open, document, onClose, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (document && open) {
      generatePreviewUrl();
    }
  }, [document, open]);

  const generatePreviewUrl = () => {
    if (!document) return;

    // For images, we can show them directly
    if (document.fileType.startsWith('image/')) {
      setPreviewUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${document.fileUrl}`);
      return;
    }

    // For PDFs, we can embed them
    if (document.fileType === 'application/pdf') {
      setPreviewUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${document.fileUrl}`);
      return;
    }

    // For other file types, we'll show a placeholder
    setPreviewUrl(null);
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.downloadDocument(document._id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Error downloading document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      if (onDelete) {
        await onDelete(document._id);
        onClose();
      }
    } catch (error) {
      setError('Error deleting document. Please try again.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return <PdfIcon color="error" />;
    if (fileType.includes('word') || fileType.includes('document')) return <DocIcon color="primary" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <ExcelIcon color="success" />;
    if (fileType.includes('image')) return <ImageIcon color="secondary" />;
    return <DocIcon color="action" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canPreview = () => {
    return document?.fileType.startsWith('image/') || document?.fileType === 'application/pdf';
  };

  if (!document) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          height: '90vh'
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
          {getFileIcon(document.fileType)}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {document.title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container sx={{ height: '100%' }}>
          {/* Document Info Sidebar */}
          <Grid item xs={12} md={4} sx={{ p: 2, borderRight: '1px solid #e5e7eb' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1f2937' }}>
                Document Information
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  {getFileIcon(document.fileType)}
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {document.fileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {document.fileType}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <StorageIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Size: {formatFileSize(document.fileSize)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <UpdateIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Version: {document.version}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Category */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <CategoryIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                </Box>
                <Chip
                  label={document.category}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                    color: '#3730a3',
                    fontWeight: 500
                  }}
                />
              </Paper>

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <TagIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Tags
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {document.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Upload Info */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Uploaded By
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {document.uploadedBy?.firstName} {document.uploadedBy?.lastName}
                </Typography>
                <Box display="flex" alignItems="center">
                  <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(document.uploadedAt)}
                  </Typography>
                </Box>
              </Paper>

              {/* Description */}
              {document.description && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {document.description}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Document Preview */}
          <Grid item xs={12} md={8} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1f2937' }}>
              Document Preview
            </Typography>

            {loading && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Loading preview...
                </Typography>
              </Box>
            )}

            {canPreview() ? (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {document.fileType.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt={document.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={() => setError('Error loading image preview')}
                  />
                ) : document.fileType === 'application/pdf' ? (
                  <iframe
                    src={previewUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title={document.title}
                    onError={() => setError('Error loading PDF preview')}
                  />
                ) : null}
              </Box>
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  p: 4
                }}
              >
                <Typography variant="h1" sx={{ mb: 2, color: '#9ca3af' }}>
                  {getFileIcon(document.fileType)}
                </Typography>
                <Typography variant="h6" sx={{ mb: 1, color: '#6b7280', textAlign: 'center' }}>
                  Preview not available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  This file type ({document.fileType}) cannot be previewed in the browser.
                  <br />
                  Please download the file to view it.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              onEdit();
              onClose();
            }}
          >
            Edit
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteClick}
          disabled={loading}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          {loading ? 'Downloading...' : 'Download'}
        </Button>
      </DialogActions>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={handleDeleteCancel}
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
          alignItems: 'center',
          color: 'error.main',
          pb: 2
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete "<strong>{document?.title}</strong>"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The document will be permanently removed from the system.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={loading}
            startIcon={<DeleteIcon />}
          >
            {loading ? 'Deleting...' : 'Delete Document'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default DocumentPreviewModal;
