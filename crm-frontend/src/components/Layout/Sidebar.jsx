import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Build as BuildIcon,
  Group as GroupIcon,
  Description as DocumentIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Customers & Orders', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Lead Management', icon: <BusinessIcon />, path: '/leads' },
  { text: 'Appointments', icon: <EventIcon />, path: '/appointments' },
  { text: 'Asset Management', icon: <BuildIcon />, path: '/assets' },
  { text: 'Employees', icon: <GroupIcon />, path: '/employees' },
  { text: 'Document Management', icon: <DocumentIcon />, path: '/documents' },
];

const Sidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle();
    }
  };

  const drawerContent = (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing(2),
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white',
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        >
          🏗️ CRM
        </Typography>
        <IconButton 
          onClick={onToggle}
          sx={{ 
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.1)',
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ paddingTop: 0 }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  margin: '4px 8px',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    transform: 'translateX(8px)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      transform: 'translateX(8px)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'white' : 'inherit',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRight: '1px solid rgba(99, 102, 241, 0.1)',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      open={open}
              sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'fixed',
            height: '100%',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderRight: '1px solid rgba(99, 102, 241, 0.1)',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 