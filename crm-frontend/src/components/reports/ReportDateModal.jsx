import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography,
  Checkbox,
  Stack,
  Alert
} from '@mui/material';
import DatePicker from 'react-datepicker';
import { 
  format, 
  subDays, 
  subMonths, 
  startOfYear, 
  startOfDay, 
  endOfDay,
  isAfter,
  isBefore
} from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const DATE_PRESETS = {
  last7: { label: 'Last 7 days', value: 'last7' },
  last30: { label: 'Last 30 days', value: 'last30' },
  last3months: { label: 'Last 3 months', value: 'last3months' },
  thisYear: { label: 'This Year', value: 'thisYear' },
  allTime: { label: 'All Time', value: 'allTime' }
};

const ReportDateModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  defaultPreset = 'last30',
  moduleTitle = 'Report'
}) => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);
  const [isAllTime, setIsAllTime] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      handlePresetChange(defaultPreset);
    }
  }, [isOpen, defaultPreset]);

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    setError('');
    
    const now = new Date();
    
    switch (preset) {
      case 'last7':
        setFromDate(subDays(now, 7));
        setToDate(now);
        setIsAllTime(false);
        break;
      case 'last30':
        setFromDate(subDays(now, 30));
        setToDate(now);
        setIsAllTime(false);
        break;
      case 'last3months':
        setFromDate(subMonths(now, 3));
        setToDate(now);
        setIsAllTime(false);
        break;
      case 'thisYear':
        setFromDate(startOfYear(now));
        setToDate(now);
        setIsAllTime(false);
        break;
      case 'allTime':
        setFromDate(null);
        setToDate(null);
        setIsAllTime(true);
        break;
      default:
        setFromDate(subDays(now, 30));
        setToDate(now);
        setIsAllTime(false);
    }
  };

  const validateDateRange = () => {
    if (isAllTime) {
      return true;
    }

    if (!fromDate || !toDate) {
      setError('Please select both start and end dates');
      return false;
    }

    const now = new Date();
    if (isAfter(fromDate, now)) {
      setError('Start date cannot be in the future');
      return false;
    }

    if (isAfter(toDate, now)) {
      setError('End date cannot be in the future');
      return false;
    }

    if (isAfter(fromDate, toDate)) {
      setError('Start date must be before or equal to end date');
      return false;
    }

    return true;
  };

  const handleGenerate = () => {
    setError('');
    
    if (!validateDateRange()) {
      return;
    }

    const reportParams = {
      from: isAllTime ? null : startOfDay(fromDate),
      to: isAllTime ? null : endOfDay(toDate),
      allTime: isAllTime,
      preset: selectedPreset
    };

    onConfirm(reportParams);
    onClose();
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleAllTimeChange = (event) => {
    const checked = event.target.checked;
    setIsAllTime(checked);
    setError('');
    
    if (checked) {
      setSelectedPreset('allTime');
      setFromDate(null);
      setToDate(null);
    } else {
      handlePresetChange('last30');
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        Generate {moduleTitle} Report
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* All Time Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllTime}
                onChange={handleAllTimeChange}
                color="primary"
              />
            }
            label="All Time (ignore date filters)"
          />

          {/* Date Range Presets */}
          {!isAllTime && (
            <FormControl component="fieldset">
              <FormLabel component="legend">Quick Date Ranges</FormLabel>
              <RadioGroup
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                {Object.values(DATE_PRESETS)
                  .filter(preset => preset.value !== 'allTime')
                  .map((preset) => (
                    <FormControlLabel
                      key={preset.value}
                      value={preset.value}
                      control={<Radio />}
                      label={preset.label}
                    />
                  ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* Custom Date Range */}
          {!isAllTime && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Custom Date Range
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    From Date
                  </Typography>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => {
                      setFromDate(date);
                      setSelectedPreset('custom');
                      setError('');
                    }}
                    selectsStart
                    startDate={fromDate}
                    endDate={toDate}
                    maxDate={new Date()}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select start date"
                    customInput={
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ width: 150 }}
                      />
                    }
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    To Date
                  </Typography>
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => {
                      setToDate(date);
                      setSelectedPreset('custom');
                      setError('');
                    }}
                    selectsEnd
                    startDate={fromDate}
                    endDate={toDate}
                    minDate={fromDate}
                    maxDate={new Date()}
                    dateFormat="MMM d, yyyy"
                    placeholderText="Select end date"
                    customInput={
                      <TextField
                        size="small"
                        variant="outlined"
                        sx={{ width: 150 }}
                      />
                    }
                  />
                </Box>
              </Stack>
            </Box>
          )}

          {/* Selected Range Display */}
          {!isAllTime && fromDate && toDate && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Selected Range:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {format(fromDate, 'MMM d, yyyy')} - {format(toDate, 'MMM d, yyyy')}
              </Typography>
            </Box>
          )}

          {isAllTime && (
            <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Typography variant="body1" fontWeight="medium" color="primary">
                All Time - No date filtering will be applied
              </Typography>
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleGenerate} 
          variant="contained" 
          color="primary"
          disabled={!isAllTime && (!fromDate || !toDate)}
        >
          Generate Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDateModal;
