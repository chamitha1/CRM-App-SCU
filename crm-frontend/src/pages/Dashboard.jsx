import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { reportsAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../components/Common/Spinner';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [leadConversions, setLeadConversions] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, conversionsRes, revenueRes] = await Promise.all([
        reportsAPI.getDashboardStats(),
        reportsAPI.getLeadConversions(),
        reportsAPI.getRevenueTrend()
      ]);

      setStats(statsRes.data);
      setLeadConversions(conversionsRes.data);
      setRevenueTrend(revenueRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set mock data for development
      setStats({
        totalCustomers: 156,
        openLeads: 23,
        upcomingAppointments: 8,
        totalAssets: 45,
        monthlyRevenue: 125000,
        activeProjects: 12
      });
      setLeadConversions([
        { month: 'Jan', conversions: 12, leads: 45 },
        { month: 'Feb', conversions: 15, leads: 52 },
        { month: 'Mar', conversions: 18, leads: 48 },
        { month: 'Apr', conversions: 22, leads: 61 },
        { month: 'May', conversions: 19, leads: 55 },
        { month: 'Jun', conversions: 25, leads: 67 }
      ]);
      setRevenueTrend([
        { month: 'Jan', revenue: 95000 },
        { month: 'Feb', revenue: 110000 },
        { month: 'Mar', revenue: 105000 },
        { month: 'Apr', revenue: 130000 },
        { month: 'May', revenue: 120000 },
        { month: 'Jun', revenue: 125000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location, refreshKey]); // Refresh when location changes or manual refresh

  // Function to manually refresh data
  const refreshDashboard = () => {
    setRefreshKey(prev => prev + 1);
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="h6">
                {title}
              </Typography>
              <Typography variant="h4" component="div">
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: color,
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );

  if (loading) {
    return <Spinner message="Loading dashboard..." />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={<PeopleIcon sx={{ color: 'white' }} />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/customers')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Open Leads"
            value={stats?.openLeads || 0}
            icon={<BusinessIcon sx={{ color: 'white' }} />}
            color={theme.palette.secondary.main}
            onClick={() => navigate('/leads')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Upcoming Appointments"
            value={stats?.upcomingAppointments || 0}
            icon={<EventIcon sx={{ color: 'white' }} />}
            color={theme.palette.success.main}
            onClick={() => navigate('/appointments')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Assets"
            value={stats?.totalAssets || 0}
            icon={<BuildIcon sx={{ color: 'white' }} />}
            color={theme.palette.warning.main}
            onClick={() => navigate('/assets')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Monthly Revenue"
            value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
            icon={<MoneyIcon sx={{ color: 'white' }} />}
            color={theme.palette.info.main}
            onClick={() => navigate('/reports')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Projects"
            value={stats?.activeProjects || 0}
            icon={<TrendingUpIcon sx={{ color: 'white' }} />}
            color={theme.palette.error.main}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Conversions
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadConversions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill={theme.palette.primary.main} name="Total Leads" />
                <Bar dataKey="conversions" fill={theme.palette.success.main} name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 