import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Header */}
      <Header onMenuToggle={handleSidebarToggle} sidebarOpen={sidebarOpen} />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%',
            md: sidebarOpen ? `calc(100% - ${240}px)` : '100%'
          },
          ml: { 
            xs: 0,
            md: sidebarOpen ? `${240}px` : 0
          },
          mt: '64px', // Height of AppBar
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 