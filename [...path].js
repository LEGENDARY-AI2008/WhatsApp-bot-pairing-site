export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const BOT_API_URL = process.env.BOT_API_URL;
    if (!BOT_API_URL) {
        return res.status(500).json({ error: 'BOT_API_URL not configured' });
    }

    const { path: routePath } = req.query;
    const targetPath = Array.isArray(routePath) ? routePath.join('/') : routePath || '';
    const targetUrl = `${BOT_API_URL}/${targetPath}`;

    try {
        const fetchOptions = {
            method: req.method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
        };

        if (req.method === 'POST' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const text = await response.text();

        try {
            const data = JSON.parse(text);
            return res.status(response.status).json(data);
        } catch {
            return res.status(response.status).send(text);
        }

    } catch (err) {
        return res.status(500).json({ 
            error: 'Failed to reach bot server. Make sure your bot is running and tunnel URL is correct.',
            details: err.message
        });
    }
}
