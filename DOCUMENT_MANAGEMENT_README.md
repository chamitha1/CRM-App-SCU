# Document Management Module

## Overview

The Document Management module replaces the Reports module in the Construction Business CRM, providing comprehensive document storage, organization, and management capabilities. This module allows users to upload, categorize, search, and manage various types of documents with role-based access control.

## Features

### 🔹 Core Functionality

- **File Upload & Storage**: Support for PDF, Word, Excel, Images, and Text files
- **Document Organization**: Categorization and tagging system
- **Search & Filtering**: Advanced search with category and tag filtering
- **Role-Based Access**: Admin/Manager (full access) vs Employee (view/upload only)
- **Version Control**: Track document versions and changes
- **Preview Support**: In-browser preview for PDFs and images

### 🔹 Document Categories

- Profit Loss
- Revenue
- Tax
- Project Docs
- Client Docs
- HR/Employee Docs
- Miscellaneous

### 🔹 File Type Support

- **PDF Documents** (.pdf) - Full preview support
- **Word Documents** (.doc, .docx) - Metadata only
- **Excel Spreadsheets** (.xls, .xlsx) - Metadata only
- **Images** (.jpg, .jpeg, .png, .gif) - Full preview support
- **Text Files** (.txt) - Metadata only

## Technical Implementation

### Backend Architecture

#### Models
- **Document.js**: MongoDB schema with comprehensive metadata
- **Indexes**: Optimized for search performance
- **File Storage**: Local file system with organized structure

#### API Endpoints

```
POST   /api/documents/upload          - Upload new document
GET    /api/documents                 - Get documents with filtering
GET    /api/documents/:id             - Get single document
PUT    /api/documents/:id             - Update document metadata
PUT    /api/documents/:id/file        - Update document file
DELETE /api/documents/:id             - Delete document
GET    /api/documents/download/:id    - Download document
GET    /api/documents/stats/overview  - Get document statistics
```

#### Security Features

- **JWT Authentication**: All endpoints require valid token
- **Role-Based Access Control**: Different permissions for different user roles
- **File Validation**: Type and size restrictions
- **Soft Delete**: Documents are marked inactive rather than permanently removed

### Frontend Architecture

#### Components

- **DocumentManagement.jsx**: Main page with document grid and controls
- **DocumentUploadModal.jsx**: Upload interface with drag & drop
- **DocumentEditModal.jsx**: Edit metadata and optionally re-upload files
- **DocumentPreviewModal.jsx**: Document preview and information display

#### Key Features

- **Responsive Grid Layout**: Cards-based design for documents
- **Advanced Search**: Real-time search with multiple filters
- **Drag & Drop Upload**: Modern file upload experience
- **Context Menus**: Quick actions for each document
- **Pagination**: Efficient handling of large document collections

## Installation & Setup

### Prerequisites

- Node.js 14+ and npm
- MongoDB 4.4+
- Existing CRM application setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd crm-backend
   npm install multer
   ```

2. **Create Uploads Directory**
   ```bash
   mkdir uploads
   ```

3. **Update Server Configuration**
   - Routes are automatically included in `server.js`
   - Static file serving is configured for uploads

4. **Environment Variables**
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd crm-frontend
   npm install
   ```

2. **Update Routes**
   - Document Management route is automatically configured
   - Sidebar navigation is updated

3. **Environment Variables**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Usage Guide

### For Users

#### Uploading Documents

1. Navigate to Document Management
2. Click "Upload Document" button
3. Drag & drop or click to select file
4. Fill in metadata (title, category, description, tags)
5. Click "Upload Document"

#### Managing Documents

- **View**: Click "View" button to preview document
- **Edit**: Use context menu (⋮) → Edit
- **Download**: Use context menu (⋮) → Download
- **Delete**: Use context menu (⋮) → Delete (managers only)

#### Searching & Filtering

- **Search Bar**: Search by title, description, or tags
- **Category Filter**: Filter by document category
- **Sort Options**: Sort by date, title, category, or file size
- **Pagination**: Navigate through large document collections

### For Administrators

#### Role Management

- **Admin**: Full CRUD access to all documents
- **Manager**: Full CRUD access to all documents
- **Employee**: View and upload only

#### System Configuration

- File size limits (default: 50MB)
- Supported file types
- Upload directory structure
- Backup and retention policies

## File Storage Structure

```
crm-backend/
├── uploads/
│   ├── document-1234567890-123456789.pdf
│   ├── document-1234567891-987654321.docx
│   └── document-1234567892-456789123.xlsx
```

## Security Considerations

### File Upload Security

- **File Type Validation**: Whitelist of allowed MIME types
- **File Size Limits**: Configurable maximum file size
- **Virus Scanning**: Consider implementing antivirus scanning
- **Path Traversal Protection**: Secure file naming and storage

### Access Control

- **Authentication Required**: All endpoints require valid JWT
- **Role-Based Permissions**: Different access levels for different roles
- **Document Ownership**: Users can only edit their own documents (unless admin/manager)
- **Audit Logging**: Track all document operations

## Performance Optimization

### Database Indexes

```javascript
// Text search index
documentSchema.index({ title: 'text', description: 'text', tags: 'text', category: 1 });

// Query optimization indexes
documentSchema.index({ uploadedBy: 1, uploadedAt: -1 });
documentSchema.index({ category: 1, uploadedAt: -1 });
```

### File Handling

- **Streaming**: Large file downloads use streaming
- **Caching**: Consider implementing file caching for frequently accessed documents
- **Compression**: Implement file compression for storage optimization

## Monitoring & Maintenance

### Health Checks

- Monitor upload directory disk space
- Check MongoDB connection and performance
- Monitor API response times
- Track file upload success/failure rates

### Backup Strategy

- **Database**: Regular MongoDB backups
- **Files**: Backup uploads directory
- **Version Control**: Consider implementing document versioning
- **Disaster Recovery**: Plan for data restoration

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check file size limits
   - Verify file type is supported
   - Ensure uploads directory has write permissions

2. **Preview Issues**
   - PDF preview requires proper MIME type handling
   - Image preview may fail with corrupted files
   - Browser compatibility for embedded viewers

3. **Performance Issues**
   - Check database indexes
   - Monitor file system performance
   - Consider implementing pagination for large collections

### Debug Mode

Enable debug logging in backend:

```javascript
// In server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## Future Enhancements

### Planned Features

- **Cloud Storage Integration**: AWS S3, Google Cloud Storage
- **Advanced Search**: Full-text search with Elasticsearch
- **Document Workflows**: Approval processes and notifications
- **Mobile App Support**: Native mobile document management
- **Integration APIs**: Connect with external document systems

### Scalability Considerations

- **Microservices**: Split into separate document service
- **Load Balancing**: Multiple server instances
- **CDN Integration**: Global file distribution
- **Database Sharding**: Horizontal scaling for large document collections

## Support & Contributing

### Getting Help

- Check the troubleshooting section above
- Review API documentation
- Check server logs for error details
- Verify environment configuration

### Contributing

1. Follow existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for any changes
4. Ensure security best practices are followed

---

## License

This module is part of the Construction Business CRM application and follows the same licensing terms.

## Version History

- **v1.0.0**: Initial release with basic document management
- **v1.1.0**: Added advanced search and filtering
- **v1.2.0**: Enhanced preview capabilities and security improvements
