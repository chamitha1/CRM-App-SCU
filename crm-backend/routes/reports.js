const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// Dashboard stats
router.get('/dashboard', (req, res) => {
    res.json({
        totalCustomers: 156,
        openLeads: 23,
        upcomingAppointments: 8,
        totalAssets: 45,
        monthlyRevenue: 125000,
        activeProjects: 12
    });
});

// Lead conversions
router.get('/lead-conversions', (req, res) => {
    res.json([
        { month: 'Jan', leads: 45, conversions: 12 },
        { month: 'Feb', leads: 52, conversions: 15 },
        { month: 'Mar', leads: 48, conversions: 18 },
        { month: 'Apr', leads: 61, conversions: 22 },
        { month: 'May', leads: 55, conversions: 19 },
        { month: 'Jun', leads: 67, conversions: 25 }
    ]);
});

// Revenue trend
router.get('/revenue-trend', (req, res) => {
    res.json([
        { month: 'Jan', revenue: 95000 },
        { month: 'Feb', revenue: 110000 },
        { month: 'Mar', revenue: 105000 },
        { month: 'Apr', revenue: 130000 },
        { month: 'May', revenue: 120000 },
        { month: 'Jun', revenue: 125000 }
    ]);
});

// Customer stats
router.get('/customers', (req, res) => {
    res.json([
        { name: 'Active', value: 120, color: '#4caf50' },
        { name: 'Pending', value: 25, color: '#ff9800' },
        { name: 'Inactive', value: 15, color: '#f44336' }
    ]);
});

// Asset stats
router.get('/assets', (req, res) => {
    res.json([
        { name: 'Available', value: 30, color: '#4caf50' },
        { name: 'In Use', value: 12, color: '#2196f3' },
        { name: 'Maintenance', value: 3, color: '#ff9800' }
    ]);
});

// CRUD: Create a new report
router.post('/', async (req, res) => {
    try {
        const report = new Report(req.body);
        await report.save();
        res.status(201).json(report);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// CRUD: Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CRUD: Get a report by ID
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CRUD: Update a report by ID
router.put('/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json(report);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// CRUD: Delete a report by ID
router.delete('/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.json({ message: 'Report deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 