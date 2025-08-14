const express = require('express');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const router = express.Router();

// Dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [totalCustomers, totalLeads, activeLeads, convertedLeads] = await Promise.all([
      Customer.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ status: { $nin: ['closed_won', 'closed_lost'] } }),
      Lead.countDocuments({ status: 'closed_won' })
    ]);

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    // Calculate total lead value
    const leadValueResult = await Lead.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$value' } } }
    ]);
    const totalLeadValue = leadValueResult.length > 0 ? leadValueResult[0].totalValue : 0;

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentCustomers, recentLeads] = await Promise.all([
      Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      totalCustomers,
      totalLeads,
      activeLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate),
      totalLeadValue,
      recentCustomers,
      recentLeads
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lead conversions over time
router.get('/lead-conversions', auth, async (req, res) => {
  try {
    const conversions = await Lead.aggregate([
      { $match: { status: 'closed_won' } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          count: 1,
          totalValue: 1
        }
      },
      { $sort: { period: 1 } },
      { $limit: 12 } // Last 12 months
    ]);

    res.json(conversions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Revenue trend
router.get('/revenue-trend', auth, async (req, res) => {
  try {
    const revenueTrend = await Lead.aggregate([
      { $match: { status: 'closed_won', value: { $gt: 0 } } },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          revenue: { $sum: '$value' },
          deals: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: {
                  if: { $lt: ['$_id.month', 10] },
                  then: { $concat: ['0', { $toString: '$_id.month' }] },
                  else: { $toString: '$_id.month' }
                }
              }
            ]
          },
          revenue: 1,
          deals: 1
        }
      },
      { $sort: { period: 1 } },
      { $limit: 12 } // Last 12 months
    ]);

    res.json(revenueTrend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer stats
router.get('/customers', auth, async (req, res) => {
  try {
    const customerStats = await Customer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    res.json(customerStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lead stats by source and status
router.get('/leads', auth, async (req, res) => {
  try {
    const [statusStats, sourceStats] = await Promise.all([
      Lead.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$value' }
          }
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            count: 1,
            totalValue: 1
          }
        }
      ]),
      Lead.aggregate([
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            source: '$_id',
            count: 1
          }
        }
      ])
    ]);

    res.json({
      byStatus: statusStats,
      bySource: sourceStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
