require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const leadRoutes = require('./routes/leads');
const reportRoutes = require('./routes/reports');
const appointmentRoutes = require('./routes/appointments');
const assetRoutes = require('./routes/assets');
const employeeRoutes = require('./routes/employees');
const otherRoutes = require('./routes/other');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/employees', employeeRoutes);
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
