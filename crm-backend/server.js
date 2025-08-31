require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Set default environment variables for development
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm-app';
process.env.PORT = process.env.PORT || 5000;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-change-in-production';

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const leadRoutes = require('./routes/leads');
const documentRoutes = require('./routes/documents');
const appointmentRoutes = require('./routes/appointments');
const assetRoutes = require('./routes/assets');
const employeeRoutes = require('./routes/employees');
const reportsRoutes = require('./routes/reports');
const otherRoutes = require('./routes/other');

const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`\ud83d\udd0d ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('\ud83d\udd0d Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('\ud83d\udd0d Body:', req.body);
  }
  next();
});

// CORS configuration with debugging
const corsOptions = {
  origin: function (origin, callback) {
    console.log('\ud83d\udd0d CORS: Request origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api', otherRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'CRM Backend API is running!' });
});

console.log('Connecting to MongoDB:', process.env.MONGO_URI);
console.log('Starting server on port:', process.env.PORT);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    const server = app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
    
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
