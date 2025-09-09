module.exports = function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  try {
    const data = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Timestamp ekle
    const messageWithTimestamp = {
      ...data,
      received_at: new Date().toISOString(),
      source: data.source || 'external'
    };

    // Messages API'ye gönder
    const apiUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/messages`;
    console.log(`Forwarding message to: ${apiUrl}`); // Hangi URL'e gönderildiğini logla

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageWithTimestamp)
    }).catch(error => {
      // Hata durumunda daha detaylı loglama
      console.error('Failed to store message. Internal fetch error:', error);
    });

    // Log the message
    console.log('Webhook received:', JSON.stringify(messageWithTimestamp));
    
    // Başarılı yanıt
    res.status(200).json({ 
      status: 'success', 
      message: 'Webhook received and logged',
      timestamp: messageWithTimestamp.received_at
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};