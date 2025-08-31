const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test document API endpoints
async function testDocumentAPI() {
  try {
    console.log('🧪 Testing Document Management API...\n');

    // Test 1: Get documents (should require auth)
    console.log('1. Testing GET /api/documents (unauthorized)...');
    try {
      const response = await axios.get(`${API_BASE}/documents`);
      console.log('❌ Should have failed with 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 2: Test document stats endpoint
    console.log('\n2. Testing GET /api/documents/stats/overview (unauthorized)...');
    try {
      const response = await axios.get(`${API_BASE}/documents/stats/overview`);
      console.log('❌ Should have failed with 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Test upload endpoint (unauthorized)
    console.log('\n3. Testing POST /api/documents/upload (unauthorized)...');
    try {
      const response = await axios.post(`${API_BASE}/documents/upload`);
      console.log('❌ Should have failed with 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📝 Note: These tests verify that the API endpoints are properly protected.');
    console.log('   To test with authentication, you would need to:');
    console.log('   1. Login to get a JWT token');
    console.log('   2. Include the token in Authorization header');
    console.log('   3. Test the actual functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testDocumentAPI();
