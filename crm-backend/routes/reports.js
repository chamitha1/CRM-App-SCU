const express = require('express');
const Report = require('../models/Report');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// GET all reports (with pagination and filtering)
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, search } = req.query;
        const skip = (page - 1) * limit;

        let query = { createdBy: req.user._id };

        // Add filters
        if (type) query.type = type;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const reports = await Report.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Report.countDocuments(query);

        res.json({
            reports,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                hasNext: skip + reports.length < total,
                hasPrev: page > 1
            }
        });
    } catch (err) {
        console.error('Get reports error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET public reports
router.get('/public', auth, async (req, res) => {
    try {
        const reports = await Report.find({ isPublic: true, status: 'active' })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (err) {
        console.error('Get public reports error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET report statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const stats = await Report.aggregate([
            { $match: { createdBy: req.user._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
                    archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } }
                }
            }
        ]);

        const typeStats = await Report.aggregate([
            { $match: { createdBy: req.user._id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            overview: stats[0] || { total: 0, active: 0, inactive: 0, archived: 0 },
            byType: typeStats
        });
    } catch (err) {
        console.error('Get report stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Dashboard analytics endpoints
router.get('/dashboard', auth, async (req, res) => {
    try {
        // Mock dashboard data
        const dashboardData = {
            totalCustomers: 150,
            totalLeads: 45,
            totalRevenue: 125000,
            monthlyGrowth: 12.5,
            recentActivity: [
                { type: 'new_customer', message: 'New customer registered', time: new Date() },
                { type: 'lead_converted', message: 'Lead converted to customer', time: new Date() },
                { type: 'appointment_scheduled', message: 'New appointment scheduled', time: new Date() }
            ]
        };
        res.json(dashboardData);
    } catch (err) {
        console.error('Get dashboard error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/revenue-trend', auth, async (req, res) => {
    try {
        // Mock revenue trend data
        const revenueData = [
            { month: 'Jan', revenue: 95000 },
            { month: 'Feb', revenue: 110000 },
            { month: 'Mar', revenue: 105000 },
            { month: 'Apr', revenue: 130000 },
            { month: 'May', revenue: 120000 },
            { month: 'Jun', revenue: 125000 }
        ];
        res.json(revenueData);
    } catch (err) {
        console.error('Get revenue trend error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/lead-conversions', auth, async (req, res) => {
    try {
        // Mock lead conversion data
        const leadData = [
            { month: 'Jan', leads: 45, conversions: 12 },
            { month: 'Feb', leads: 52, conversions: 15 },
            { month: 'Mar', leads: 48, conversions: 18 },
            { month: 'Apr', leads: 61, conversions: 22 },
            { month: 'May', leads: 55, conversions: 19 },
            { month: 'Jun', leads: 67, conversions: 25 }
        ];
        res.json(leadData);
    } catch (err) {
        console.error('Get lead conversions error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/customers', auth, async (req, res) => {
    try {
        // Mock customer statistics
        const customerStats = [
            { name: 'Active', value: 120, color: '#4caf50' },
            { name: 'Pending', value: 25, color: '#ff9800' },
            { name: 'Inactive', value: 15, color: '#f44336' }
        ];
        res.json(customerStats);
    } catch (err) {
        console.error('Get customer stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/assets', auth, async (req, res) => {
    try {
        // Mock asset statistics
        const assetStats = [
            { name: 'Available', value: 30, color: '#4caf50' },
            { name: 'In Use', value: 12, color: '#2196f3' },
            { name: 'Maintenance', value: 3, color: '#ff9800' }
        ];
        res.json(assetStats);
    } catch (err) {
        console.error('Get asset stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET single report by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user can access this report
        if (!report.isPublic && report.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(report);
    } catch (err) {
        console.error('Get report error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create new report
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, type, data, filters, isPublic, schedule } = req.body;

        // Validate required fields
        if (!title || !description || !type || !data) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const report = new Report({
            title,
            description,
            type,
            data,
            filters: filters || {},
            createdBy: req.user._id,
            isPublic: isPublic || false,
            schedule: schedule || { frequency: 'none' }
        });

        await report.save();

        const populatedReport = await Report.findById(report._id)
            .populate('createdBy', 'name email');

        res.status(201).json(populatedReport);
    } catch (err) {
        console.error('Create report error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update report
router.put('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user can update this report
        if (report.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { title, description, type, data, filters, isPublic, schedule, status } = req.body;

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                type,
                data,
                filters,
                isPublic,
                schedule,
                status
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        res.json(updatedReport);
    } catch (err) {
        console.error('Update report error:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE report
router.delete('/:id', auth, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user can delete this report
        if (report.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Report.findByIdAndDelete(req.params.id);

        res.json({ message: 'Report deleted successfully' });
    } catch (err) {
        console.error('Delete report error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH update report status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'inactive', 'archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user can update this report
        if (report.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('createdBy', 'name email');

        res.json(updatedReport);
    } catch (err) {
        console.error('Update report status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 