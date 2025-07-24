# Construction CRM Frontend

A modern React-based Customer Relationship Management (CRM) system specifically designed for construction businesses. Built with Material-UI, React Router, and comprehensive state management.

## 🚀 Features

### Core Modules
- **Dashboard**: Overview with key metrics and charts
- **Customer & Order Management**: Complete customer lifecycle management
- **Lead Management**: Lead tracking with conversion capabilities
- **Appointment Scheduling**: Calendar-based appointment system
- **Asset Management**: Equipment and resource tracking
- **Employee Management**: Staff and role management
- **Reports & Analytics**: Comprehensive business insights

### Technical Features
- 🔐 JWT-based authentication
- 📱 Responsive design (mobile-first)
- 🎨 Material-UI components
- 📊 Interactive charts with Recharts
- 🔄 Real-time data updates
- 📝 Form validation
- 🔔 Toast notifications
- 🛡️ Protected routes

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **JWT Decode** - Token handling
- **React Toastify** - Notifications
- **Recharts** - Data visualization

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crm-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── Common/         # Reusable components
│   │   └── Spinner.jsx
│   └── Layout/         # Layout components
│       ├── Header.jsx
│       ├── Layout.jsx
│       ├── ProtectedRoute.jsx
│       └── Sidebar.jsx
├── contexts/
│   └── AuthContext.js  # Authentication context
├── pages/              # Main application pages
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Leads.jsx
│   ├── Appointments.jsx
│   ├── Assets.jsx
│   ├── Employees.jsx
│   └── Reports.jsx
├── services/
│   └── api.js          # API service layer
├── App.js              # Main application component
└── index.js            # Application entry point
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

### API Endpoints

The application expects the following API endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

#### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

#### Leads
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `POST /api/leads/:id/convert` - Convert lead to customer

#### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

#### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

#### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

#### Reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/lead-conversions` - Lead conversion data
- `GET /api/reports/revenue-trend` - Revenue trend data
- `GET /api/reports/customers` - Customer statistics
- `GET /api/reports/assets` - Asset statistics

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 🔐 Authentication

The application uses JWT tokens for authentication:

1. **Login**: Users authenticate with email/password
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Auto-logout**: Tokens are validated on app load
4. **Protected Routes**: All main pages require authentication

### User Roles
- **Admin**: Full access to all features
- **Manager**: Access to most features
- **Employee**: Limited access based on permissions

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🎨 Customization

### Theme Configuration
The Material-UI theme can be customized in `src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  // Add more theme customizations
});
```

### Styling
- Uses Material-UI's `sx` prop for component styling
- Consistent spacing using theme spacing units
- Responsive breakpoints for different screen sizes

## 🧪 Development

### Adding New Features
1. Create new components in appropriate directories
2. Add routes in `App.js`
3. Update sidebar navigation in `Sidebar.jsx`
4. Add API endpoints in `services/api.js`

### Code Style
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Use TypeScript for better type safety (optional)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

### Version 1.0.0
- Initial release with core CRM functionality
- Complete authentication system
- All six main modules implemented
- Responsive design
- Chart visualizations

---

**Note**: This frontend application requires a corresponding backend API to function properly. Make sure the backend is running and accessible at the configured API URL. 