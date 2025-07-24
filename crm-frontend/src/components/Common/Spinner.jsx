import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Spinner = ({ message = 'Loading...', size = 40 }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress size={size} />
      {message && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Spinner; 