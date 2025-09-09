module.exports = function handler(req, res) {
  // CORS headers - daha kapsamlı
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method allowed' });
  }

  try {
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx buffering'i kapat

    // İlk bağlantı onayı
    res.write(`data: ${JSON.stringify({ 
      type: 'connection', 
      status: 'connected',
      timestamp: new Date().toISOString() 
    })}\n\n`);

    console.log('SSE client connected');

    // Keepalive için interval
    const keepAlive = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ 
          type: 'ping', 
          timestamp: new Date().toISOString() 
        })}\n\n`);
      } catch (error) {
        clearInterval(keepAlive);
        console.error('Keepalive error:', error);
      }
    }, 10000); // Her 10 saniyede ping

    // Bağlantı kapandığında temizle
    req.on('close', () => {
      clearInterval(keepAlive);
      console.log('SSE client disconnected');
    });

    req.on('error', (error) => {
      clearInterval(keepAlive);
      console.error('SSE request error:', error);
    });

    // 25 saniye sonra kapat (Vercel limiti)
    setTimeout(() => {
      clearInterval(keepAlive);
      try {
        res.write(`data: ${JSON.stringify({ 
          type: 'close', 
          reason: 'timeout',
          timestamp: new Date().toISOString() 
        })}\n\n`);
        res.end();
      } catch (error) {
        console.error('Error closing SSE:', error);
      }
    }, 25000);

  } catch (error) {
    console.error('SSE setup error:', error);
    res.status(500).json({ error: 'SSE setup failed' });
  }
};