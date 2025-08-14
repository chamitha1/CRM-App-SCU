const express = require('express');
const router = express.Router();

// Dashboard data endpoint
router.get('/dashboard', async (req, res) => {
  try {
    // Mock dashboard data - replace with actual database queries
    const dashboardData = {
      totalLeads: 150,
      totalCustomers: 75,
      totalRevenue: 125000,
      monthlyGrowth: 12.5,
      activeAppointments: 25,
      completedAppointments: 180,
      pendingTasks: 8,
      overdueInvoices: 3
    };
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Lead conversions endpoint
router.get('/lead-conversions', async (req, res) => {
  try {
    // Mock lead conversion data
    const leadConversions = [
      { month: 'Jan', leads: 45, conversions: 12 },
      { month: 'Feb', leads: 52, conversions: 18 },
      { month: 'Mar', leads: 38, conversions: 15 },
      { month: 'Apr', leads: 61, conversions: 22 },
      { month: 'May', leads: 49, conversions: 19 },
      { month: 'Jun', leads: 55, conversions: 25 }
    ];
    
    res.json(leadConversions);
  } catch (error) {
    console.error('Error fetching lead conversions:', error);
    res.status(500).json({ message: 'Error fetching lead conversions' });
  }
});

// Revenue trend endpoint
router.get('/revenue-trend', async (req, res) => {
  try {
    // Mock revenue trend data
    const revenueTrend = [
      { month: 'Jan', revenue: 18500 },
      { month: 'Feb', revenue: 22300 },
      { month: 'Mar', revenue: 19800 },
      { month: 'Apr', revenue: 25600 },
      { month: 'May', revenue: 21900 },
      { month: 'Jun', revenue: 28400 }
    ];
    
    res.json(revenueTrend);
  } catch (error) {
    console.error('Error fetching revenue trend:', error);
    res.status(500).json({ message: 'Error fetching revenue trend' });
  }
});

module.exports = router;
