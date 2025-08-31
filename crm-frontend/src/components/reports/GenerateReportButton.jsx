import React, { useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import ReportDateModal from './ReportDateModal';
import { toast } from 'react-toastify';

const GenerateReportButton = ({ 
  moduleKey, 
  moduleTitle, 
  onGenerate, 
  size = 'medium',
  variant = 'outlined',
  disabled = false,
  defaultPreset = 'last30'
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenModal = () => {
    if (disabled) return;
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleConfirmGenerate = async (reportParams) => {
    setIsGenerating(true);
    
    try {
      // Store the last used preset in localStorage
      localStorage.setItem(`report_preset_${moduleKey}`, reportParams.preset);
      
      await onGenerate(reportParams);
      
      toast.success(`${moduleTitle} report generated successfully!`);
    } catch (error) {
      console.error(`Error generating ${moduleKey} report:`, error);
      toast.error(`Failed to generate ${moduleTitle} report. Please try again.`);
    } finally {
      setIsGenerating(false);
      setModalOpen(false);
    }
  };

  // Get the last used preset from localStorage
  const getDefaultPreset = () => {
    return localStorage.getItem(`report_preset_${moduleKey}`) || defaultPreset;
  };

  return (
    <Box>
      <Button
        variant={variant}
        size={size}
        startIcon={isGenerating ? <CircularProgress size={16} /> : <PdfIcon />}
        onClick={handleOpenModal}
        disabled={disabled || isGenerating}
        sx={{
          minWidth: 140,
          '&:hover': {
            transform: 'translateY(-1px)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate Report'}
      </Button>

      <ReportDateModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmGenerate}
        moduleTitle={moduleTitle}
        defaultPreset={getDefaultPreset()}
      />
    </Box>
  );
};

export default GenerateReportButton;
