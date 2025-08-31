import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
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
import { reportsAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../components/Common/Spinner';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await reportsAPI.getDashboardStats();
      setStats(statsRes.data);
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

    </Box>
  );
};

export default Dashboard; 