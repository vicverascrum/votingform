export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, totalHours, selectedQuestions } = req.body;

    // Hacer request a tu API
    const response = await fetch('http://44.223.24.11/api-simple.php?action=submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, totalHours, selectedQuestions })
    });

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
