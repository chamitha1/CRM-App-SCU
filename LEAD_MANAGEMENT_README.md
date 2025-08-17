# CRM Lead Management System with MongoDB

## Overview
I've created a complete Lead Management system for your CRM application with the following CRUD operations:
- **CREATE** - Add new leads
- **READ** - View and search leads
- **UPDATE** - Edit existing leads
- **DELETE** - Remove leads

## What Was Created

### 1. MongoDB Schema (`crm-backend/models/Lead.js`)
```javascript
Lead Schema includes:
- name (required)
- email (required, unique)
- phone (required)
- company (required)
- source (Website, Referral, Social Media, Cold Call, Other)
- status (new, contacted, qualified, lost)
- estimatedValue (number)
- notes (optional)
- assignedTo (reference to User)
- timestamps (createdAt, updatedAt)
```

### 2. Controller (`crm-backend/controllers/leadController.js`)
Complete CRUD operations:
- `getLeads()` - Get all leads with pagination, search, filtering
- `getLeadById()` - Get single lead
- `createLead()` - Add new lead ✅
- `updateLead()` - Update existing lead ✅
- `deleteLead()` - Delete lead ✅
- `convertLead()` - Convert lead to customer
- `getLeadsStats()` - Get lead statistics

### 3. API Routes (`crm-backend/routes/leads.js`)
```
GET    /api/leads           - Get all leads
GET    /api/leads/:id       - Get single lead
POST   /api/leads           - Create new lead ✅
PUT    /api/leads/:id       - Update lead ✅
DELETE /api/leads/:id       - Delete lead ✅
POST   /api/leads/:id/convert - Convert to customer
GET    /api/leads/stats     - Get statistics
```

### 4. Authentication Middleware (`crm-backend/middleware/auth.js`)
- JWT token protection for all routes
- User authentication and authorization

### 5. Updated Server Configuration
- Added lead routes to `server.js`
- CORS configuration
- MongoDB connection

## CRUD Operations Explained

### 1. ADD LEAD (CREATE) ✅
**Endpoint:** `POST /api/leads`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "ABC Corp",
  "source": "Website",
  "status": "new",
  "estimatedValue": 5000,
  "notes": "Interested in our services"
}
```

**Features:**
- Validates required fields
- Checks for duplicate emails
- Sets default values
- Returns created lead with ID

### 2. UPDATE LEAD ✅
**Endpoint:** `PUT /api/leads/:id`

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "status": "contacted",
  "estimatedValue": 7500,
  "notes": "Had initial conversation"
}
```

**Features:**
- Updates only provided fields
- Validates email uniqueness
- Automatically sets lastContactDate when status changes to 'contacted'
- Returns updated lead

### 3. DELETE LEAD ✅
**Endpoint:** `DELETE /api/leads/:id`

**Features:**
- Validates lead exists
- Permanently removes lead from database
- Returns success confirmation

## Frontend Integration

Your existing React frontend (`src/pages/Leads.jsx`) already has:
- ✅ Add Lead Dialog
- ✅ Edit Lead functionality
- ✅ Delete Lead confirmation
- ✅ Search and filtering
- ✅ Pagination
- ✅ Status management

## Setup Instructions

### 1. Install Backend Dependencies
```bash
cd crm-backend
npm install
```

### 2. Environment Setup
Create `.env` file in `crm-backend/` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm_database
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB
Make sure MongoDB is running locally or use MongoDB Atlas cloud.

### 4. Start Backend Server
```bash
cd crm-backend
npm run dev
```

### 5. Start Frontend
```bash
cd crm-frontend
npm start
```

## API Testing Examples

### Create a Lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-0123",
    "company": "Smith Industries",
    "source": "Referral",
    "estimatedValue": 10000
  }'
```

### Update a Lead
```bash
curl -X PUT http://localhost:5000/api/leads/LEAD_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "qualified",
    "notes": "Ready to proceed with project"
  }'
```

### Delete a Lead
```bash
curl -X DELETE http://localhost:5000/api/leads/LEAD_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Features

### Indexes for Performance
- Email index for uniqueness
- Status index for filtering
- Text search index for name, company, email
- CreatedAt index for sorting

### Data Validation
- Email format validation
- Required field validation
- Enum validation for source and status
- Number validation for estimatedValue

### Advanced Features
- Pagination support
- Search functionality
- Status filtering
- Sorting options
- Lead conversion to customer
- Statistics and reporting

## File Structure
```
crm-backend/
├── models/
│   └── Lead.js                 # MongoDB schema
├── controllers/
│   └── leadController.js       # Business logic
├── routes/
│   └── leads.js               # API endpoints
├── middleware/
│   └── auth.js                # Authentication
├── server.js                  # Main server file
├── package.json               # Dependencies
└── .env.example              # Environment variables template
```

## Next Steps

1. **Test the API**: Use the provided curl examples or Postman
2. **Authentication**: Make sure users are logged in to access lead routes
3. **Database**: Ensure MongoDB is running and connected
4. **Frontend**: The existing React frontend will work with these APIs

Your Lead Management system is now complete with full CRUD operations using MongoDB! 🎉
