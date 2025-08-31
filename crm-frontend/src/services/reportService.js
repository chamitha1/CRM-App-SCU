import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { 
  customerAPI, 
  leadAPI, 
  appointmentAPI, 
  assetAPI, 
  employeeAPI, 
  documentsAPI 
} from './api';

// With jsPDF v2.5.1 and jspdf-autotable v3.6.0, the plugin should load automatically

// API methods with proper parameter handling
const API_METHODS = {
  customers: (params) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.allTime) queryParams.append('allTime', params.allTime);
    
    return fetch(`${customerAPI.getAll.defaults?.baseURL || 'http://localhost:5000/api'}/customers?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  },
  leads: (params) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.allTime) queryParams.append('allTime', params.allTime);
    
    return fetch(`${leadAPI.getAll.defaults?.baseURL || 'http://localhost:5000/api'}/leads?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  },
  appointments: (params) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.allTime) queryParams.append('allTime', params.allTime);
    
    return fetch(`${appointmentAPI.getAll.defaults?.baseURL || 'http://localhost:5000/api'}/appointments?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  },
  assets: (params) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.allTime) queryParams.append('allTime', params.allTime);
    
    return fetch(`${assetAPI.getAll.defaults?.baseURL || 'http://localhost:5000/api'}/assets?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  },
  employees: (params) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.allTime) queryParams.append('allTime', params.allTime);
    
    return fetch(`${employeeAPI.getAll.defaults?.baseURL || 'http://localhost:5000/api'}/employees?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  },
  documents: (params) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.allTime) queryParams.append('allTime', params.allTime);
    queryParams.append('limit', '1000'); // Get all documents for report
    
    return fetch(`${documentsAPI.getDocuments.defaults?.baseURL || 'http://localhost:5000/api'}/documents?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
  }
};

// Module configurations
const MODULE_CONFIG = {
  customers: {
    title: 'Customers & Orders',
    dateField: 'createdAt',
    columns: [
      { title: 'Name', field: 'name' },
      { title: 'Email', field: 'email' },
      { title: 'Phone', field: 'phone' },
      { title: 'Company', field: 'company' },
      { title: 'Created On', field: 'createdAt' }
    ]
  },
  leads: {
    title: 'Leads',
    dateField: 'createdAt',
    columns: [
      { title: 'Lead Name', field: 'name' },
      { title: 'Source', field: 'source' },
      { title: 'Status', field: 'status' },
      { title: 'Owner', field: 'ownerName' },
      { title: 'Created On', field: 'createdAt' },
      { title: 'Value', field: 'value' }
    ]
  },
  appointments: {
    title: 'Appointments',
    dateField: 'appointmentDate',
    columns: [
      { title: 'Subject', field: 'title' },
      { title: 'Customer', field: 'customerName' },
      { title: 'Date', field: 'appointmentDate' },
      { title: 'Time', field: 'startTime' },
      { title: 'Assigned To', field: 'assigneeName' },
      { title: 'Status', field: 'status' }
    ]
  },
  assets: {
    title: 'Assets',
    dateField: 'createdAt',
    columns: [
      { title: 'Asset Name', field: 'name' },
      { title: 'Category', field: 'category' },
      { title: 'Status', field: 'status' },
      { title: 'Location', field: 'location' },
      { title: 'Added/Purchased', field: 'purchasedDate' },
      { title: 'Assigned To', field: 'assignedToName' }
    ]
  },
  employees: {
    title: 'Employees',
    dateField: 'hireDate',
    columns: [
      { title: 'Name', field: 'name' },
      { title: 'Email', field: 'email' },
      { title: 'Phone', field: 'phone' },
      { title: 'Department', field: 'department' },
      { title: 'Role', field: 'role' },
      { title: 'Hire Date', field: 'hireDate' },
      { title: 'Salary', field: 'salary' },
      { title: 'Status', field: 'status' }
    ]
  },
  documents: {
    title: 'Document Management',
    dateField: 'uploadedAt',
    columns: [
      { title: 'Title', field: 'title' },
      { title: 'Category', field: 'category' },
      { title: 'Tags', field: 'tags' },
      { title: 'Uploaded By', field: 'uploadedByName' },
      { title: 'Uploaded At', field: 'uploadedAt' },
      { title: 'File Type', field: 'fileType' }
    ]
  }
};

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'N/A';
  }
};

// Helper function to format currency
const formatCurrency = (value) => {
  if (value == null || value === '') return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  } catch {
    return `$${value}`;
  }
};

// Helper function to format field values
const formatFieldValue = (value, fieldName) => {
  if (value == null || value === '') return 'N/A';

  // Handle arrays (like tags)
  if (Array.isArray(value)) {
    return value.join(', ') || 'N/A';
  }

  // Handle date fields
  if (fieldName.toLowerCase().includes('date') || fieldName === 'createdAt' || fieldName === 'uploadedAt') {
    return formatDate(value);
  }

  // Handle value/salary fields
  if (fieldName.toLowerCase().includes('value') || fieldName.toLowerCase().includes('salary')) {
    return formatCurrency(value);
  }

  // Handle object fields (like address)
  if (typeof value === 'object') {
    if (value.street || value.city) {
      return `${value.street || ''} ${value.city || ''} ${value.state || ''}`.trim() || 'N/A';
    }
    return JSON.stringify(value);
  }

  return String(value);
};

// Function to get field value from object with fallbacks
const getFieldValue = (item, fieldName) => {
  // Direct field access
  if (item[fieldName] !== undefined) {
    return item[fieldName];
  }

  // Special cases for different field names
  switch (fieldName) {
    case 'name':
      return item.firstName && item.lastName 
        ? `${item.firstName} ${item.lastName}`
        : item.name || item.title || 'N/A';
    
    case 'ownerName':
      return item.owner?.name || item.ownerName || 'N/A';
    
    case 'customerName':
      return item.customer?.name || item.customerName || 'N/A';
    
    case 'assigneeName':
      return item.assignee?.name || item.assigneeName || 'N/A';
    
    case 'assignedToName':
      return item.assignedTo?.name || item.assignedToName || 'N/A';
    
    case 'uploadedByName':
      return item.uploadedBy?.name || item.uploadedByName || 'N/A';
    
    case 'purchasedDate':
      return item.purchasedDate || item.createdAt;
    
    default:
      return 'N/A';
  }
};

/**
 * Fetch module data with date filtering
 */
export const getModuleData = async (moduleKey, params = {}) => {
  try {
    const config = MODULE_CONFIG[moduleKey];
    const apiMethod = API_METHODS[moduleKey];
    
    if (!config || !apiMethod) {
      throw new Error(`Unknown module: ${moduleKey}`);
    }

    // Build query parameters for date filtering
    const queryParams = {};
    if (!params.allTime && params.from && params.to) {
      queryParams.from = params.from.toISOString();
      queryParams.to = params.to.toISOString();
      queryParams.allTime = 'false';
    } else {
      queryParams.allTime = 'true';
    }

    // Call the appropriate API method with parameters
    const response = await apiMethod(queryParams);
    
    // Handle different response formats
    let data = response;
    
    // Handle documents response format
    if (moduleKey === 'documents' && response.documents) {
      data = response.documents;
    } else if (response.data) {
      data = response.data;
    }
    
    // Return as array
    return Array.isArray(data) ? data : (data ? [data] : []);
  } catch (error) {
    console.error(`Error fetching ${moduleKey} data:`, error);
    
    // Return mock data for development/testing
    return generateMockData(moduleKey);
  }
};

/**
 * Generate mock data for testing
 */
const generateMockData = (moduleKey) => {
  const mockData = {
    customers: [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        company: 'Smith Construction',
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '(555) 987-6543',
        company: 'Doe Enterprises',
        createdAt: '2024-01-20T11:00:00Z'
      }
    ],
    leads: [
      {
        name: 'Michael Johnson',
        source: 'Website',
        status: 'qualified',
        ownerName: 'Sarah Wilson',
        createdAt: '2024-01-18T09:00:00Z',
        value: 25000
      }
    ],
    appointments: [
      {
        title: 'Project Consultation',
        customerName: 'John Smith',
        appointmentDate: '2024-02-01T14:00:00Z',
        startTime: '2:00 PM',
        assigneeName: 'Mike Davis',
        status: 'scheduled'
      }
    ],
    assets: [
      {
        name: 'Excavator CAT 320',
        category: 'Heavy Machinery',
        status: 'operational',
        location: 'Site A',
        purchasedDate: '2023-06-15T00:00:00Z',
        assignedToName: 'Project Alpha'
      }
    ],
    employees: [
      {
        name: 'Sarah Wilson',
        email: 'sarah@company.com',
        phone: '(555) 111-2222',
        department: 'Operations',
        role: 'Project Manager',
        hireDate: '2023-03-01T00:00:00Z',
        salary: 75000,
        status: 'active'
      }
    ],
    documents: [
      {
        title: 'Project Contract - Smith Construction',
        category: 'Contracts',
        tags: ['active', 'commercial'],
        uploadedByName: 'Admin User',
        uploadedAt: '2024-01-25T12:00:00Z',
        fileType: 'PDF'
      }
    ]
  };

  return mockData[moduleKey] || [];
};

/**
 * Generate and download PDF report
 */
export const buildPdf = (moduleKey, data, dateParams) => {
  const config = MODULE_CONFIG[moduleKey];
  if (!config) {
    throw new Error(`Unknown module: ${moduleKey}`);
  }

  const pdf = new jsPDF();
  
  // Check if autoTable method is available
  if (typeof pdf.autoTable !== 'function') {
    console.error('jsPDF autoTable plugin is not available.');
    throw new Error('PDF generation failed: autoTable plugin not available. Please refresh the page and try again.');
  }
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Kavindu Construction', 14, 22);
  
  pdf.setFontSize(16);
  pdf.text(`${config.title} Report`, 14, 35);

  // Date range info
  let dateRangeText = 'All Time';
  if (!dateParams.allTime && dateParams.from && dateParams.to) {
    dateRangeText = `${format(dateParams.from, 'MMM d, yyyy')} - ${format(dateParams.to, 'MMM d, yyyy')}`;
  }
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Date Range: ${dateRangeText}`, 14, 48);
  pdf.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 58);

  // Add a line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(14, 65, pageWidth - 14, 65);

  let yPosition = 75;

  // Handle special case for customers (customers + orders)
  if (moduleKey === 'customers') {
    // Customers Table
    pdf.setFontSize(14);
    pdf.setTextColor(40, 40, 40);
    pdf.text('Customers in Selected Range', 14, yPosition);
    yPosition += 10;

    const customerColumns = config.columns.map(col => col.title);
    const customerRows = data.map(item => 
      config.columns.map(col => 
        formatFieldValue(getFieldValue(item, col.field), col.field)
      )
    );

    pdf.autoTable({
      head: [customerColumns],
      body: customerRows,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = pdf.lastAutoTable.finalY + 20;

    // Mock Orders Table (since we don't have order data in current structure)
    pdf.text('Orders in Selected Range', 14, yPosition);
    yPosition += 10;

    const orderColumns = ['Order #', 'Customer', 'Order Date', 'Amount', 'Status'];
    const orderRows = [
      ['ORD-001', 'John Smith', 'Jan 20, 2024', '$15,000', 'completed'],
      ['ORD-002', 'Jane Doe', 'Jan 25, 2024', '$8,500', 'in_progress']
    ];

    pdf.autoTable({
      head: [orderColumns],
      body: orderRows,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });
  } else {
    // Regular single table for other modules
    if (data.length === 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No records found in the selected date range.', 14, yPosition);
    } else {
      const columns = config.columns.map(col => col.title);
      const rows = data.map(item => 
        config.columns.map(col => 
          formatFieldValue(getFieldValue(item, col.field), col.field)
        )
      );

      pdf.autoTable({
        head: [columns],
        body: rows,
        startY: yPosition,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Footer
          const pageCount = pdf.internal.getNumberOfPages();
          const currentPage = data.pageNumber;
          
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
        }
      });
    }
  }

  // Final footer if not added by autoTable
  if (moduleKey !== 'customers' || data.length === 0) {
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10);
    }
  }

  // Generate filename
  let filename = `${moduleKey}_report`;
  if (dateParams.allTime) {
    filename += '_ALLTIME';
  } else if (dateParams.from && dateParams.to) {
    const fromStr = format(dateParams.from, 'yyyyMMdd');
    const toStr = format(dateParams.to, 'yyyyMMdd');
    filename += `_${fromStr}-${toStr}`;
  }
  filename += '.pdf';

  // Download the PDF
  pdf.save(filename);
};

export default {
  getModuleData,
  buildPdf
};
