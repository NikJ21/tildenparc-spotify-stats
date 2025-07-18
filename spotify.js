const express = require('express');
const request = require('request');
const app = express();

// Spotify credentials
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = 'AQB6QgjeTHVnvDfa8mnZ3PXNdht_RL-CMHw5QotbxlWr70v3v9DJONUW4SJaI4itGpYU1CuothrwHJEittqXFEKT3PdeU_sMrAYM_20eJzHYvDQx6Jydj2tmuceR69XvluQ';

const authBuffer = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

// Route to get Spotify stats
app.get('/api/spotify', (req, res) => {
    const options = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + authBuffer,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        },
        json: true,
    };

    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;

            const statsOptions = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true,
            };

            request.get(statsOptions, (err, resp, data) => {
                if (!err && resp.statusCode === 200) {
                    res.json({
                        display_name: data.display_name,
                        followers: data.followers.total,
                        profile_url: data.external_urls.spotify,
                    });
                } else {
                    res.status(500).json({ error: 'Failed to fetch stats from Spotify' });
                }
            });
        } else {
            res.status(500).json({ error: 'Failed to refresh token' });
        }
    });
});

// Start server (for local testing)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
