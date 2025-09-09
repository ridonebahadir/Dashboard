const express = require('express');
const path = require('path');
const http = require('http'); // Need to use http server directly
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

// Broadcast function to send data to all connected clients
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Gelen isteklerdeki JSON gövdelerini ayrıştırmak için middleware
app.use(express.json());

// Webhook isteklerini karşılayacak olan endpoint
app.post('/webhook', (req, res) => {
  console.log('Webhook alındı:');
  console.log('Body:', req.body);

  // Broadcast the webhook body to all connected WebSocket clients
  wss.broadcast(JSON.stringify(req.body, null, 2));

  // Başarılı bir yanıt gönder
  res.status(200).send('Webhook başarıyla alındı ve istemcilere gönderildi.');
});

// Ana sayfada index.html dosyasını sun
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use the http server to listen instead of the express app
server.listen(port, () => {
  console.log(`Sunucu ve WebSocket http://localhost:${port} adresinde çalışıyor`);
});