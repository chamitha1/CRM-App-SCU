require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('../models/Asset');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const sampleAssets = [
  {
    name: 'Excavator CAT 320',
    type: 'Heavy Equipment',
    serialNumber: 'CAT320-2024-001',
    purchaseDate: new Date('2024-01-10'),
    purchasePrice: 150000,
    location: 'Construction Site A',
    status: 'available',
    assignedTo: 'Mike Johnson',
    lastMaintenance: new Date('2024-01-15'),
    notes: 'Primary excavator for large construction projects. Excellent condition.',
    depreciation: {
      method: 'straight-line',
      usefulLife: 10,
      salvageValue: 15000
    },
    warranty: {
      provider: 'Caterpillar Inc.',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2027-01-10'),
      coverage: 'Full manufacturer warranty including parts and labor'
    },
    maintenanceHistory: [
      {
        date: new Date('2024-01-15'),
        description: 'Initial setup and calibration after purchase',
        cost: 500,
        performedBy: 'CAT Service Team'
      }
    ]
  },
  {
    name: 'Crane 50 Ton Mobile',
    type: 'Lifting Equipment',
    serialNumber: 'CRANE50-2023-005',
    purchaseDate: new Date('2023-06-15'),
    purchasePrice: 250000,
    location: 'Construction Site B',
    status: 'in-use',
    assignedTo: 'John Smith',
    lastMaintenance: new Date('2024-01-20'),
    notes: 'Heavy-duty mobile crane for high-rise construction. Regular maintenance required.',
    depreciation: {
      method: 'straight-line',
      usefulLife: 15,
      salvageValue: 25000
    },
    warranty: {
      provider: 'Grove Cranes',
      startDate: new Date('2023-06-15'),
      endDate: new Date('2025-06-15'),
      coverage: 'Hydraulic system and structural components'
    },
    maintenanceHistory: [
      {
        date: new Date('2023-12-15'),
        description: '6-month service - hydraulic fluid change, cable inspection',
        cost: 1200,
        performedBy: 'Grove Service Center'
      },
      {
        date: new Date('2024-01-20'),
        description: 'Annual safety inspection and certification',
        cost: 800,
        performedBy: 'Certified Inspector'
      }
    ]
  },
  {
    name: 'Concrete Mixer Truck',
    type: 'Vehicles',
    serialNumber: 'MIXER-2024-003',
    purchaseDate: new Date('2024-02-01'),
    purchasePrice: 85000,
    location: 'Main Depot',
    status: 'maintenance',
    assignedTo: 'Robert Davis',
    lastMaintenance: new Date('2024-01-25'),
    notes: 'Recently purchased concrete mixer. Currently undergoing routine maintenance.',
    depreciation: {
      method: 'straight-line',
      usefulLife: 8,
      salvageValue: 8500
    },
    maintenanceHistory: [
      {
        date: new Date('2024-01-25'),
        description: 'Post-purchase inspection and minor repairs',
        cost: 350,
        performedBy: 'In-house Mechanic'
      }
    ]
  },
  {
    name: 'Pneumatic Drill Set',
    type: 'Tools',
    serialNumber: 'DRILL-2023-012',
    purchaseDate: new Date('2023-08-10'),
    purchasePrice: 2500,
    location: 'Tool Storage A',
    status: 'available',
    assignedTo: '',
    lastMaintenance: new Date('2023-11-10'),
    notes: 'Professional-grade pneumatic drill set with accessories.',
    depreciation: {
      method: 'straight-line',
      usefulLife: 5,
      salvageValue: 250
    },
    maintenanceHistory: [
      {
        date: new Date('2023-11-10'),
        description: 'Quarterly maintenance - lubrication and filter replacement',
        cost: 75,
        performedBy: 'Tool Technician'
      }
    ]
  },
  {
    name: 'Forklift Toyota 5000lb',
    type: 'Lifting Equipment',
    serialNumber: 'TOYOTA-FL-2022-008',
    purchaseDate: new Date('2022-12-05'),
    purchasePrice: 32000,
    location: 'Warehouse B',
    status: 'in-use',
    assignedTo: 'Sarah Wilson',
    lastMaintenance: new Date('2023-12-05'),
    notes: 'Warehouse forklift in excellent working condition. Due for annual service soon.',
    depreciation: {
      method: 'straight-line',
      usefulLife: 10,
      salvageValue: 3200
    },
    warranty: {
      provider: 'Toyota Material Handling',
      startDate: new Date('2022-12-05'),
      endDate: new Date('2024-12-05'),
      coverage: 'Engine and transmission warranty'
    },
    maintenanceHistory: [
      {
        date: new Date('2023-06-05'),
        description: '6-month service - oil change, brake inspection',
        cost: 220,
        performedBy: 'Toyota Service'
      },
      {
        date: new Date('2023-12-05'),
        description: 'Annual service - comprehensive inspection and tune-up',
        cost: 450,
        performedBy: 'Toyota Service'
      }
    ]
  },
  {
    name: 'Generator Diesel 100KW',
    type: 'Other',
    serialNumber: 'GEN-100-2024-002',
    purchaseDate: new Date('2024-01-20'),
    purchasePrice: 18000,
    location: 'Equipment Yard',
    status: 'available',
    assignedTo: '',
    lastMaintenance: new Date('2024-02-01'),
    notes: 'Backup power generator for construction sites. Portable unit.',
    depreciation: {
      method: 'straight-line',
      usefulLife: 12,
      salvageValue: 1800
    },
    maintenanceHistory: [
      {
        date: new Date('2024-02-01'),
        description: 'Initial setup and load testing',
        cost: 200,
        performedBy: 'Electrical Contractor'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing assets
    await Asset.deleteMany({});
    console.log('Existing assets cleared.');
    
    // Insert sample assets
    const createdAssets = await Asset.insertMany(sampleAssets);
    console.log(`${createdAssets.length} sample assets created successfully!`);
    
    // Display created assets summary
    console.log('\nCreated Assets Summary:');
    console.log('========================');
    createdAssets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.name} (${asset.serialNumber}) - ${asset.status}`);
    });
    
    // Display some statistics
    const stats = await Asset.aggregate([
      {
        $group: {
          _id: null,
          totalAssets: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' },
          averageValue: { $avg: '$purchasePrice' }
        }
      }
    ]);
    
    console.log('\nDatabase Statistics:');
    console.log('===================');
    console.log(`Total Assets: ${stats[0].totalAssets}`);
    console.log(`Total Value: $${stats[0].totalValue.toLocaleString()}`);
    console.log(`Average Value: $${Math.round(stats[0].averageValue).toLocaleString()}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the seeding function
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

// Check if this script is being run directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase, sampleAssets };
