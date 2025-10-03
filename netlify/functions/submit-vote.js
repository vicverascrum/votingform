const https = require('https');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Hacer request a tu API
    const postData = JSON.stringify({
      email: data.email,
      totalHours: data.totalHours,
      selectedQuestions: data.selectedQuestions
    });

    const options = {
      hostname: '44.223.24.11',
      port: 80,
      path: '/api-simple.php?action=submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify(result)
            });
          } catch (e) {
            resolve({
              statusCode: 500,
              headers,
              body: JSON.stringify({ success: false, error: 'Parse error' })
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: error.message })
        });
      });

      req.write(postData);
      req.end();
    });

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
