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

    console.log('Proxying to:', targetUrl);

    try {
        const fetchOptions = {
            method: req.method,
            headers: { 
                'Content-Type': 'application/json',
                'cf-access-bypass': 'true',
                'User-Agent': 'LegendaryBot/1.0'
            },
        };

        if (req.method === 'POST' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const text = await response.text();
        
        console.log('Response status:', response.status);
        console.log('Response body:', text);

        try {
            const data = JSON.parse(text);
            return res.status(response.status).json(data);
        } catch {
            return res.status(response.status).send(text);
        }

    } catch (err) {
        console.log('Fetch error:', err.message);
        return res.status(500).json({ 
            error: 'Failed to reach bot server. Make sure your bot is running and tunnel URL is correct.',
            details: err.message
        });
    }
}
