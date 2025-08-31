const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    // Test the server is running
    try {
      const healthCheck = await axios.get('http://localhost:5000/');
      console.log('Server is running:', healthCheck.data);
    } catch (error) {
      console.error('Server is not running on port 5000');
      console.error('Error:', error.message);
      return;
    }
    
    // Test login with default credentials
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    console.log('Attempting login with:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message);
    console.error('Full error:', error.message);
    
    if (error.response?.status === 400) {
      console.log('\nThis is a 400 Bad Request error - same as your frontend issue!');
      console.log('Response data:', error.response.data);
    }
  }
}

testLogin();
