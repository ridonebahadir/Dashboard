// Global değişken - basit memory storage (üretim için database kullanın)
let messages = [];
let eventListeners = [];

export default function handler(req, res) {
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
      received_at: new Date().toISOString()
    };

    // Mesajı sakla (son 100 mesaj)
    messages.push(messageWithTimestamp);
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }

    // Tüm SSE dinleyicilerine gönder
    const eventData = JSON.stringify(messageWithTimestamp);
    eventListeners.forEach(listener => {
      try {
        listener.res.write(`data: ${eventData}\n\n`);
      } catch (error) {
        console.error('Error sending to listener:', error);
      }
    });

    console.log('Webhook received:', data);
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Webhook received and broadcasted',
      listeners: eventListeners.length
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export etmek için helper functions
export { messages, eventListeners };