import React, { useState } from 'react';
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
  Assessment as AssessmentIcon,
  Menu as MenuIcon,
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
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
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
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" color="primary">
          Construction CRM
        </Typography>
        {isMobile && (
          <IconButton onClick={onToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
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
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
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
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 