
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const ARTIST_ID = '3GjbpcGv2AIvBaWHZkmp94';

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
        }),
    });

    const data = await response.json();
    return data.access_token;
}

app.get('/stats', async (req, res) => {
    try {
        const accessToken = await getAccessToken();
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${ARTIST_ID}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const artistData = await artistResponse.json();
        res.json({
            name: artistData.name,
            followers: artistData.followers.total,
            popularity: artistData.popularity,
            genres: artistData.genres,
            profile_url: artistData.external_urls.spotify,
        });
    } catch (error) {
        console.error('Error fetching artist stats:', error);
        res.status(500).json({ error: 'Failed to fetch artist stats' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
