const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test login endpoint
async function testLogin() {
  try {
    console.log('🧪 Testing Login API...\n');

    // Test 1: Test with valid credentials
    console.log('1. Testing POST /api/auth/login with valid credentials...');
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('✅ Login successful:', response.data);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.status, error.response?.data);
    }

    // Test 2: Test with missing email
    console.log('\n2. Testing POST /api/auth/login with missing email...');
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        password: 'admin123'
      });
      console.log('❌ Should have failed with 400');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returned 400 Bad Request');
        console.log('Error message:', error.response?.data?.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Test with missing password
    console.log('\n3. Testing POST /api/auth/login with missing password...');
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com'
      });
      console.log('❌ Should have failed with 400');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returned 400 Bad Request');
        console.log('Error message:', error.response?.data?.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 4: Test with empty body
    console.log('\n4. Testing POST /api/auth/login with empty body...');
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {});
      console.log('❌ Should have failed with 400');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returned 400 Bad Request');
        console.log('Error message:', error.response?.data?.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testLogin();
