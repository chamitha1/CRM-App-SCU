# Construction CRM Application

A comprehensive Customer Relationship Management (CRM) system designed specifically for construction companies. This application provides tools for managing customers, leads, appointments, assets, employees, and reports.

## Features

### 🔐 Authentication & Authorization
- User registration and login with JWT tokens
- Role-based access control (Admin, Manager, Employee)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 📊 Report Management
- Create, read, update, and delete reports
- Multiple report types (Sales, Customer, Lead, Appointment, Asset, Employee, Financial, Custom)
- Public and private reports
- Report scheduling capabilities
- Advanced filtering and search
- Report statistics and analytics

### 🏗️ Core CRM Features
- Customer management
- Lead tracking and conversion
- Appointment scheduling
- Asset management
- Employee management
- Dashboard with analytics

### 🎨 Modern UI/UX
- Material-UI components
- Responsive design
- Toast notifications
- Loading states
- Form validation

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Compression** - Response compression

### Frontend
- **React** - UI library
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Recharts** - Data visualization
- **JWT Decode** - Token decoding

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (v4.4 or higher)

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd CRM-App-SCU
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd crm-frontend
npm install
cd ..
```

### 3. Set up environment variables

Create a `config.env` file in the `crm-backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm_database
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
NODE_ENV=development
```

Create a `config.env` file in the `crm-frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the application

#### Development mode (both frontend and backend)
```bash
npm run dev
```

#### Backend only
```bash
npm run server
```

#### Frontend only
```bash
npm run client
```

#### Production build
```bash
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Reports
- `GET /api/reports` - Get all reports (with pagination and filtering)
- `GET /api/reports/public` - Get public reports
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `PATCH /api/reports/:id/status` - Update report status
- `GET /api/reports/stats/overview` - Get report statistics

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'manager', 'employee'])
}
```

### Report Model
```javascript
{
  title: String (required),
  description: String (required),
  type: String (enum: ['sales', 'customer', 'lead', 'appointment', 'asset', 'employee', 'financial', 'custom']),
  data: Mixed (required),
  filters: Mixed,
  createdBy: ObjectId (ref: 'User'),
  isPublic: Boolean,
  schedule: {
    frequency: String (enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'none']),
    nextRun: Date,
    recipients: Array
  },
  status: String (enum: ['active', 'inactive', 'archived'])
}
```

## Project Structure

```
CRM-App-SCU/
├── crm-backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Report.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── config.env
├── crm-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Common/
│   │   │   └── Layout/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   ├── public/
│   └── config.env
├── package.json
└── README.md
```

## Usage

1. **Start the application** using `npm run dev`
2. **Open your browser** and navigate to `http://localhost:3000`
3. **Register a new account** or login with existing credentials
4. **Navigate to the Reports section** to manage reports
5. **Create, edit, and delete reports** as needed

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Protected API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
