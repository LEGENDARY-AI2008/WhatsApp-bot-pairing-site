export default async function handler(req, res) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const BOT_API_URL = process.env.BOT_API_URL;
    if (!BOT_API_URL) {
        return res.status(500).json({ error: 'BOT_API_URL not configured in Vercel environment variables' });
    }

    const { path: routePath } = req.query;
    const targetPath = Array.isArray(routePath) ? routePath.join('/') : routePath || '';
    const targetUrl = `${BOT_API_URL}/${targetPath}`;

    try {
        const fetchOptions = {
            method: req.method,
            headers: { 
                'Content-Type': 'application/json',
                'bypass-tunnel-reminder': 'true',
                'User-Agent': 'LegendaryBot/1.0'
            },
        };

        if (req.method === 'POST') {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();
        return res.status(response.status).json(data);

    } catch (err) {
        return res.status(500).json({ 
            error: 'Failed to reach bot server. Make sure your bot is running and tunnel URL is correct.',
            details: err.message
        });
    }
}
