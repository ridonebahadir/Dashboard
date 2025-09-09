// Import shared storage
import { messages, eventListeners } from './webhook.js';

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method allowed' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // İlk bağlantıda mevcut mesajları gönder
  if (messages.length > 0) {
    messages.slice(-10).forEach(message => { // Son 10 mesaj
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    });
  }

  // Keepalive ping gönder
  res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);

  // Client'ı listener listesine ekle
  const listener = { res, timestamp: Date.now() };
  eventListeners.push(listener);

  console.log(`SSE client connected. Total listeners: ${eventListeners.length}`);

  // Bağlantı kapandığında temizle
  req.on('close', () => {
    const index = eventListeners.indexOf(listener);
    if (index !== -1) {
      eventListeners.splice(index, 1);
      console.log(`SSE client disconnected. Total listeners: ${eventListeners.length}`);
    }
  });

  // 25 saniye timeout (Vercel'in 30 saniye limitinden önce)
  setTimeout(() => {
    const index = eventListeners.indexOf(listener);
    if (index !== -1) {
      eventListeners.splice(index, 1);
      console.log('SSE connection timeout');
    }
    res.end();
  }, 25000);
}