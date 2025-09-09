const fs = require('fs');
const path = require('path');

// Vercel'in yazılabilir /tmp dizinini kullan
const storagePath = path.join('/tmp', 'messages.json');

// Yardımcı fonksiyon: dosyadan mesajları oku
function readMessages() {
    try {
        if (fs.existsSync(storagePath)) {
            const data = fs.readFileSync(storagePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading messages file:', error);
    }
    return [];
}

// Yardımcı fonksiyon: dosyaya mesajları yaz
function writeMessages(messages) {
    try {
        fs.writeFileSync(storagePath, JSON.stringify(messages, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing messages file:', error);
    }
}

module.exports = function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const messages = readMessages();
            const recentMessages = messages.slice(-50).reverse();
            return res.status(200).json({
                messages: recentMessages,
                count: messages.length,
                timestamp: new Date().toISOString()
            });
        }

        if (req.method === 'POST') {
            const data = req.body;
            if (!data) {
                return res.status(400).json({ error: 'No data provided' });
            }

            const messages = readMessages();

            const messageWithTimestamp = {
                ...data,
                id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                received_at: new Date().toISOString()
            };

            messages.push(messageWithTimestamp);

            // Son 1000 mesajı sakla
            const trimmedMessages = messages.slice(-1000);

            writeMessages(trimmedMessages);

            console.log('Message stored:', JSON.stringify(messageWithTimestamp));

            return res.status(200).json({
                status: 'success',
                message: 'Message stored',
                id: messageWithTimestamp.id,
                total: trimmedMessages.length
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Messages API error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
