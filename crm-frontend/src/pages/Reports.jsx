import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { reportsAPI } from '../services/api';
import Spinner from '../components/Common/Spinner';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [customerStats, setCustomerStats] = useState([]);
  const [assetStats, setAssetStats] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      const [customerRes, assetRes] = await Promise.all([
        reportsAPI.getCustomerStats(),
        reportsAPI.getAssetStats()
      ]);

      setCustomerStats(customerRes.data);
      setAssetStats(assetRes.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Mock data for development
      setCustomerStats([
        { name: 'Active', value: 120, color: '#4caf50' },
        { name: 'Pending', value: 25, color: '#ff9800' },
        { name: 'Inactive', value: 15, color: '#f44336' }
      ]);
      setAssetStats([
        { name: 'Available', value: 30, color: '#4caf50' },
        { name: 'In Use', value: 12, color: '#2196f3' },
        { name: 'Maintenance', value: 3, color: '#ff9800' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner message="Loading reports..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Customer Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Customer Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Asset Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Asset Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>



        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4">
                {customerStats.reduce((sum, item) => sum + item.value, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Assets
              </Typography>
              <Typography variant="h4">
                {assetStats.reduce((sum, item) => sum + item.value, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Reports; 