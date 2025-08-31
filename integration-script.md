# Report Integration for Remaining Modules

## To complete the integration, add the following to each module page:

### 1. Leads.jsx
Add these imports at the top:
```jsx
import GenerateReportButton from '../components/reports/GenerateReportButton';
import * as reportService from '../services/reportService';
```

Add this function in the component:
```jsx
const handleGenerateReport = async (reportParams) => {
  try {
    const data = await reportService.getModuleData('leads', reportParams);
    reportService.buildPdf('leads', data, reportParams);
  } catch (error) {
    console.error('Error generating leads report:', error);
    throw error;
  }
};
```

Update the header to include the button:
```jsx
<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
  <Typography variant="h4">Leads</Typography>
  <Stack direction="row" spacing={2}>
    <GenerateReportButton
      moduleKey="leads"
      moduleTitle="Leads"
      onGenerate={handleGenerateReport}
    />
    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
      Add Lead
    </Button>
  </Stack>
</Box>
```

### 2. Appointments.jsx
Same pattern as above but with:
- moduleKey="appointments"
- moduleTitle="Appointments"

### 3. Assets.jsx
Same pattern as above but with:
- moduleKey="assets"
- moduleTitle="Assets"

### 4. Employees.jsx
Same pattern as above but with:
- moduleKey="employees"
- moduleTitle="Employees"

### 5. DocumentManagement.jsx
Same pattern as above but with:
- moduleKey="documents"
- moduleTitle="Document Management"

## Files Created:
1. ✅ `/components/reports/ReportDateModal.jsx` - Date range modal with presets
2. ✅ `/components/reports/GenerateReportButton.jsx` - Consistent report button
3. ✅ `/services/reportService.js` - Data fetching and PDF generation
4. ✅ Updated all backend routes for date filtering
5. ✅ Integrated into Customers page (example)

## Backend Updates Completed:
- ✅ customers.js - Filter by createdAt
- ✅ leads.js - Filter by createdAt  
- ✅ appointments.js - Filter by startDate (appointmentDate)
- ✅ assets.js - Filter by createdAt
- ✅ employees.js - Filter by hireDate
- ✅ documents.js - Filter by uploadedAt

## Dependencies Added:
- ✅ jspdf
- ✅ jspdf-autotable
- ✅ react-datepicker

## Features Implemented:
- Date range picker with presets (Last 7 days, 30 days, 3 months, This Year, All Time)
- Asia/Colombo timezone handling
- PDF generation with proper formatting
- Module-specific column configurations
- Consistent UX across all modules
- Error handling and loading states
- LocalStorage for last used preset
- Proper file naming conventions

## Ready to Use:
The Customers module is fully integrated and ready to test. Apply the same pattern to the remaining 5 modules to complete the implementation.
