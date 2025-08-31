import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Pagination,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Description as DocIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Tag as TagIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { documentsAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';
import DocumentUploadModal from '../components/Documents/DocumentUploadModal';
import DocumentEditModal from '../components/Documents/DocumentEditModal';
import DocumentPreviewModal from '../components/Documents/DocumentPreviewModal';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  
  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Context menu
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
  
  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const categories = [
    'Profit Loss',
    'Revenue', 
    'Tax',
    'Project Docs',
    'Client Docs',
    'HR/Employee Docs',
    'Miscellaneous'
  ];

  useEffect(() => {
    fetchDocuments();
  }, [page, selectedCategory, searchTerm, sortBy, sortOrder]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.getDocuments({
        page,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        sortBy,
        sortOrder
      });
      
      setDocuments(response.data.documents);
      setTotalPages(response.data.totalPages);
      setTotalDocuments(response.data.total);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching documents',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    fetchDocuments();
    setSnackbar({
      open: true,
      message: 'Document uploaded successfully!',
      severity: 'success'
    });
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    fetchDocuments();
    setSnackbar({
      open: true,
      message: 'Document updated successfully!',
      severity: 'success'
    });
  };

  const handleDelete = async (documentId) => {
    try {
      await documentsAPI.deleteDocument(documentId);
      fetchDocuments();
      setSnackbar({
        open: true,
        message: 'Document deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting document',
        severity: 'error'
      });
    }
    setContextMenu(null);
    setDeleteConfirmOpen(false);
  };

  const openDeleteConfirm = (document) => {
    setSelectedDocument(document);
    setDeleteConfirmOpen(true);
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await documentsAPI.downloadDocument(documentId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documents.find(doc => doc._id === documentId)?.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error downloading document',
        severity: 'error'
      });
    }
    setContextMenu(null);
  };

  const handleContextMenu = (event, document) => {
    event.preventDefault();
    setSelectedDocument(document);
    setContextMenuAnchor(event.currentTarget);
    setContextMenu(true);
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && documents.length === 0) {
    return <Spinner message="Loading documents..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1f2937' }}>
          Document Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadModalOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }
          }}
        >
          Upload Document
        </Button>
      </Box>

      {/* Search and Filter Toolbar */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="uploadedAt">Upload Date</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="fileSize">File Size</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              sx={{ minWidth: '100px' }}
            >
              {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Results Summary */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {documents.length} of {totalDocuments} documents
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Page {page} of {totalPages}
        </Typography>
      </Box>

      {/* Documents Grid */}
      <Grid container spacing={3}>
        {documents.map((document) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={document._id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Document Icon and Type */}
                <Box display="flex" alignItems="center" mb={2}>
                  {getFileIcon(document.fileType)}
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    {document.fileType.split('/')[1]?.toUpperCase()}
                  </Typography>
                </Box>

                {/* Title */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {document.title}
                </Typography>

                {/* Description */}
                {document.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {document.description}
                  </Typography>
                )}

                {/* Category */}
                <Chip
                  icon={<CategoryIcon />}
                  label={document.category}
                  size="small"
                  sx={{ 
                    mb: 1,
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                    color: '#3730a3',
                    fontWeight: 500
                  }}
                />

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {document.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        icon={<TagIcon />}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {document.tags.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{document.tags.length - 3} more
                      </Typography>
                    )}
                  </Box>
                )}

                {/* File Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Size: {formatFileSize(document.fileSize)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Version: {document.version}
                  </Typography>
                </Box>

                {/* Upload Info */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {document.uploadedBy?.firstName} {document.uploadedBy?.lastName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(document.uploadedAt)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

                                       {/* Actions */}
                         <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                           <Button
                             size="small"
                             startIcon={<ViewIcon />}
                             onClick={() => {
                               setSelectedDocument(document);
                               setPreviewModalOpen(true);
                             }}
                             sx={{ color: '#6366f1' }}
                           >
                             View
                           </Button>
                           <Box display="flex" gap={0.5}>
                                                            <Button
                                 size="small"
                                 variant="outlined"
                                 color="error"
                                 startIcon={<DeleteIcon />}
                                 onClick={() => openDeleteConfirm(document)}
                                 sx={{ 
                                   borderColor: 'error.main',
                                   color: 'error.main',
                                   '&:hover': {
                                     borderColor: 'error.dark',
                                     backgroundColor: 'error.light',
                                     color: 'error.contrastText'
                                   }
                                 }}
                               >
                                 Delete
                               </Button>
                             <IconButton
                               size="small"
                               onClick={(e) => handleContextMenu(e, document)}
                             >
                               <MoreIcon />
                             </IconButton>
                           </Box>
                         </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        categories={categories}
      />

      {/* Edit Modal */}
      <DocumentEditModal
        open={editModalOpen}
        document={selectedDocument}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        categories={categories}
      />

                                        {/* Preview Modal */}
                 <DocumentPreviewModal
                   open={previewModalOpen}
                   document={selectedDocument}
                   onClose={() => setPreviewModalOpen(false)}
                   onEdit={() => setEditModalOpen(true)}
                   onDelete={handleDelete}
                 />

                 {/* Delete Confirmation Dialog */}
                 <Dialog
                   open={deleteConfirmOpen}
                   onClose={() => setDeleteConfirmOpen(false)}
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
                       Are you sure you want to delete "<strong>{selectedDocument?.title}</strong>"?
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                       This action cannot be undone. The document will be permanently removed from the system.
                     </Typography>
                   </DialogContent>
                   <DialogActions sx={{ p: 3, pt: 0 }}>
                     <Button onClick={() => setDeleteConfirmOpen(false)}>
                       Cancel
                     </Button>
                     <Button
                       variant="contained"
                       color="error"
                       onClick={() => handleDelete(selectedDocument?._id)}
                       startIcon={<DeleteIcon />}
                     >
                       Delete Document
                     </Button>
                   </DialogActions>
                 </Dialog>

                 {/* Context Menu */}
      <Menu
        anchorEl={contextMenuAnchor}
        open={contextMenu}
        onClose={() => setContextMenu(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            setEditModalOpen(true);
            setContextMenu(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDownload(selectedDocument?._id)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
                           <MenuItem
                     onClick={() => {
                       openDeleteConfirm(selectedDocument);
                       setContextMenu(null);
                     }}
                     sx={{ color: 'error.main' }}
                   >
                     <ListItemIcon>
                       <DeleteIcon fontSize="small" color="error" />
                     </ListItemIcon>
                     <ListItemText>Delete</ListItemText>
                   </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentManagement;
