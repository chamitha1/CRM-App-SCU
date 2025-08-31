const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...');
    
    // Test 1: Check if server is responding
    try {
      const healthCheck = await axios.get('http://localhost:5000/api/auth/me');
      console.log('Server is responding');
    } catch (error) {
      console.log('Server response status:', error.response?.status || 'No response');
    }
    
    // Test 2: Try login with valid credentials
    console.log('\n1. Testing with admin credentials...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('✅ Login successful:', response.data);
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
    console.log('Data:', error.response?.data);
    console.log('Request data sent:', error.config?.data);
    console.log('Full error message:', error.message);
    
    // Test 3: Try with empty credentials to see different error
    try {
      console.log('\n2. Testing with empty credentials...');
      await axios.post('http://localhost:5000/api/auth/login', {});
    } catch (emptyError) {
      console.log('Empty credentials error:', emptyError.response?.data);
    }
  }
}

testLogin();