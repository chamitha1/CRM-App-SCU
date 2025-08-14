# Asset Management Module - CRM Application

## Overview
The Asset Management module is a comprehensive system for tracking, managing, and maintaining company assets. This module is part of the larger CRM application and provides full CRUD operations along with advanced features like maintenance tracking, depreciation calculation, and asset analytics.

## Features

### Core Functionality
- **Asset CRUD Operations**: Create, Read, Update, Delete assets
- **Asset Categories**: Heavy Equipment, Lifting Equipment, Tools, Vehicles, Other
- **Asset Status Tracking**: Available, In-Use, Maintenance, Out-of-Service
- **Serial Number Management**: Unique serial number tracking with validation
- **Location Tracking**: Track asset locations and assignments

### Advanced Features
- **Maintenance Management**: 
  - Track maintenance history
  - Add new maintenance records
  - Maintenance due alerts
  - Maintenance cost tracking
- **Depreciation Calculation**: 
  - Straight-line depreciation
  - Current asset value calculation
  - Configurable useful life and salvage value
- **Asset Analytics**: 
  - Asset statistics dashboard
  - Status breakdowns
  - Type and location analytics
  - Maintenance alerts
- **Document Management**: Track warranty information and asset documents

## Project Structure

### Backend Files
```
crm-backend/
├── models/Asset.js              # Asset MongoDB schema with advanced features
├── routes/assets.js             # Asset API routes with full CRUD operations
├── middleware/auth.js           # Authentication and authorization middleware
├── scripts/seedData.js          # Database seeding script with sample data
├── package.json                 # Backend dependencies
└── .env.example                 # Environment configuration template
```

### Frontend Files
```
crm-frontend/src/
├── pages/Assets.jsx             # Main asset management interface
└── services/api.js              # API service with asset endpoints
```

## Installation & Setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd crm-backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env file with your MongoDB URI and other configurations
   ```

3. **Database Setup**
   ```bash
   # Seed the database with sample assets
   npm run seed
   ```

4. **Start the Backend Server**
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

### Frontend Setup

1. **Install Dependencies** (if not already done)
   ```bash
   cd crm-frontend
   npm install
   ```

2. **Start the Frontend**
   ```bash
   npm start
   ```

## API Endpoints

### Asset Management
- `GET /api/assets` - Get all assets with pagination and filtering
- `GET /api/assets/:id` - Get single asset by ID
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update existing asset
- `DELETE /api/assets/:id` - Delete asset

### Asset Analytics
- `GET /api/assets/stats` - Get asset statistics and analytics

### Maintenance Management
- `POST /api/assets/:id/maintenance` - Add maintenance record
- `GET /api/assets/:id/maintenance` - Get maintenance history
- `GET /api/assets/maintenance/due` - Get assets due for maintenance

## Data Model

### Asset Schema
```javascript
{
  name: String,                    // Asset name (required)
  type: String,                    // Asset category (enum)
  serialNumber: String,            // Unique serial number
  purchaseDate: Date,              // Purchase date
  purchasePrice: Number,           // Purchase price
  location: String,                // Current location
  status: String,                  // Current status (enum)
  assignedTo: String,              // Person assigned to
  lastMaintenance: Date,           // Last maintenance date
  maintenanceHistory: [Object],    // Array of maintenance records
  notes: String,                   // Additional notes
  depreciation: Object,            // Depreciation settings
  warranty: Object,                // Warranty information
  documents: [Object],             // Associated documents
  timestamps: true                 // createdAt, updatedAt
}
```

### Maintenance Record Schema
```javascript
{
  date: Date,                      // Maintenance date (required)
  description: String,             // Description (required)
  cost: Number,                    // Maintenance cost
  performedBy: String              // Technician/company (required)
}
```

## Frontend Features

### Asset Management Interface
- **Data Table**: Paginated asset listing with sorting
- **Add/Edit Modal**: Form-based asset creation and editing
- **Status Indicators**: Color-coded status chips
- **Action Buttons**: Edit and delete functionality

### Key Components
- **Assets.jsx**: Main asset management page
- **Material-UI Components**: Professional UI with tables, forms, and dialogs
- **Toast Notifications**: User feedback for operations
- **Loading States**: Spinner during data operations

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Route protection middleware
- Role-based access control support
- Asset access control (configurable)

### Data Validation
- Server-side validation for all inputs
- Unique serial number enforcement
- Required field validation
- Data type validation

## Sample Data

The system comes with sample assets including:
- Excavator CAT 320 (Heavy Equipment)
- Mobile Crane 50 Ton (Lifting Equipment)
- Concrete Mixer Truck (Vehicles)
- Pneumatic Drill Set (Tools)
- Forklift Toyota (Lifting Equipment)
- Diesel Generator 100KW (Other)

Each sample asset includes:
- Complete asset information
- Maintenance history
- Depreciation settings
- Warranty information

## Usage Examples

### Creating a New Asset
1. Navigate to Asset Management page
2. Click "Add Asset" button
3. Fill in the required fields:
   - Asset Name
   - Type (from dropdown)
   - Serial Number (must be unique)
   - Purchase Date
   - Purchase Price
   - Location
4. Set optional fields:
   - Status
   - Assigned To
   - Last Maintenance Date
5. Click "Create" to save

### Adding Maintenance Record (API)
```javascript
POST /api/assets/:id/maintenance
{
  "date": "2024-02-15",
  "description": "Quarterly maintenance and oil change",
  "cost": 250,
  "performedBy": "ABC Maintenance Services"
}
```

### Filtering Assets (API)
```javascript
GET /api/assets?status=available&type=Heavy Equipment&location=Site A
```

## Integration with CRM

The Asset Management module integrates seamlessly with the CRM system:
- **Authentication**: Uses the same JWT auth system
- **Navigation**: Accessible through the main CRM sidebar
- **Styling**: Consistent with CRM theme using Material-UI
- **API Structure**: Follows the same patterns as other CRM modules

## Development Notes

### Technologies Used
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Material-UI
- **Authentication**: JWT tokens
- **Database**: MongoDB with Mongoose ODM

### Key Design Patterns
- RESTful API design
- Middleware-based authentication
- Component-based React architecture
- Centralized API service layer
- Error handling and user feedback

### Future Enhancements
- File upload for asset photos and documents
- Barcode/QR code scanning
- Asset check-in/check-out system
- Advanced reporting with charts
- Email notifications for maintenance due
- Mobile app support
- Asset location tracking with GPS

## Testing

### Manual Testing Checklist
- [ ] Create new asset
- [ ] Edit existing asset
- [ ] Delete asset
- [ ] View asset list with pagination
- [ ] Filter assets by status/type
- [ ] Add maintenance record
- [ ] View maintenance history
- [ ] Check authentication protection

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Get all assets
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/assets

# Create new asset
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"name":"Test Asset","type":"Tools","serialNumber":"TEST-001","purchaseDate":"2024-01-01","purchasePrice":1000,"location":"Test Location"}' http://localhost:5000/api/assets
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure JWT token is valid and not expired
   - Check Authorization header format: `Bearer <token>`

2. **Database Connection Issues**
   - Verify MongoDB URI in .env file
   - Ensure MongoDB is running
   - Check network connectivity

3. **Duplicate Serial Number**
   - Serial numbers must be unique
   - Check existing assets before creating new ones

4. **Validation Errors**
   - Ensure all required fields are provided
   - Check data types match schema requirements

## Support

For issues or questions regarding the Asset Management module:
1. Check this README for common solutions
2. Review the API documentation
3. Check console logs for error messages
4. Verify all dependencies are properly installed

## Contributing

When contributing to the Asset Management module:
1. Follow existing code patterns and structure
2. Add appropriate error handling
3. Update documentation for new features
4. Test all functionality before submitting
5. Ensure security best practices are followed
