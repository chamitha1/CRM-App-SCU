const http = require('http');

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function test() {
  console.log('Testing server...');
  
  try {
    // Test server status
    const health = await makeRequest('GET', '/', {});
    console.log('Server status:', health.status, health.data);
    
    // Test login
    console.log('\nTesting login...');
    const login = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    console.log('Login response:', login.status, login.data);
    
    // Test with missing fields
    console.log('\nTesting with missing email...');
    const missingEmail = await makeRequest('POST', '/api/auth/login', {
      password: 'admin123'
    });
    console.log('Missing email response:', missingEmail.status, missingEmail.data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
