const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testLeadCRUD() {
  console.log('🧪 Testing Lead CRUD Operations...\n');

  try {
    // Test 1: Get all leads
    console.log('1. Testing GET /api/leads');
    const getResponse = await axios.get(`${API_BASE}/leads`);
    console.log('✅ GET Success:', getResponse.status);
    console.log('Current leads count:', getResponse.data.data?.length || 0);

    // Test 2: Create a new lead
    console.log('\n2. Testing POST /api/leads (Create Lead)');
    const newLead = {
      name: 'Test Lead',
      email: `test${Date.now()}@example.com`, // Unique email
      phone: '555-0123',
      company: 'Test Company',
      source: 'Website',
      status: 'new',
      estimatedValue: 5000,
      notes: 'This is a test lead created via API'
    };

    const createResponse = await axios.post(`${API_BASE}/leads`, newLead);
    console.log('✅ CREATE Success:', createResponse.status);
    const createdLead = createResponse.data.data;
    console.log('Created lead ID:', createdLead._id);

    // Test 3: Update the created lead
    console.log('\n3. Testing PUT /api/leads/:id (Update Lead)');
    const updateData = {
      name: 'Updated Test Lead',
      status: 'contacted',
      estimatedValue: 7500,
      notes: 'Updated via API test'
    };

    const updateResponse = await axios.put(`${API_BASE}/leads/${createdLead._id}`, updateData);
    console.log('✅ UPDATE Success:', updateResponse.status);
    console.log('Updated lead name:', updateResponse.data.data.name);

    // Test 4: Get the specific lead
    console.log('\n4. Testing GET /api/leads/:id (Get Single Lead)');
    const getOneResponse = await axios.get(`${API_BASE}/leads/${createdLead._id}`);
    console.log('✅ GET ONE Success:', getOneResponse.status);
    console.log('Lead status:', getOneResponse.data.data.status);

    // Test 5: Delete the created lead
    console.log('\n5. Testing DELETE /api/leads/:id (Delete Lead)');
    const deleteResponse = await axios.delete(`${API_BASE}/leads/${createdLead._id}`);
    console.log('✅ DELETE Success:', deleteResponse.status);

    // Test 6: Verify deletion
    console.log('\n6. Verifying deletion...');
    try {
      await axios.get(`${API_BASE}/leads/${createdLead._id}`);
      console.log('❌ Lead should have been deleted');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Lead successfully deleted (404 as expected)');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status);
      }
    }

    console.log('\n🎉 All CRUD operations completed successfully!');
    console.log('✅ CREATE - Working');
    console.log('✅ READ - Working');
    console.log('✅ UPDATE - Working');
    console.log('✅ DELETE - Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Make sure:');
    console.error('1. Backend server is running on port 5000');
    console.error('2. MongoDB is running and connected');
    console.error('3. Authentication is disabled for testing');
  }
}

testLeadCRUD();
