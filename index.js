
const express = require('express');
const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const ARTIST_ID = '3GjbpcGv2AIvBaWHZkmp94';

async function getAccessToken() {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        const response = await axios.post(tokenUrl, qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
        }), {
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
        throw new Error('Could not get access token');
    }
}

async function getArtistStats(accessToken) {
    const url = `https://api.spotify.com/v1/artists/${ARTIST_ID}`;
    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching artist stats:', error.response ? error.response.data : error.message);
        throw new Error('Could not fetch artist stats');
    }
}

app.get('/', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const stats = await getArtistStats(accessToken);
        res.json({
            artist: stats.name,
            followers: stats.followers.total,
            genres: stats.genres,
            popularity: stats.popularity,
            spotify_url: stats.external_urls.spotify
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch artist stats' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
