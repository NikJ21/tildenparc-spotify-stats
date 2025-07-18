
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token
    })
  });

  const data = await response.json();
  return data.access_token;
}

app.get('/api/stats', async (req, res) => {
  try {
    const access_token = await getAccessToken();
    const artistResponse = await fetch(`https://api.spotify.com/v1/artists/3GjbpcGv2AIvBaWHZkmp94`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!artistResponse.ok) {
      const errorDetails = await artistResponse.json();
      return res.status(artistResponse.status).json({
        error: 'Failed to fetch artist stats',
        details: errorDetails
      });
    }

    const artistData = await artistResponse.json();
    res.json({
      name: artistData.name,
      followers: artistData.followers.total,
      genres: artistData.genres,
      popularity: artistData.popularity,
      profile_url: artistData.external_urls.spotify
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Spotify Artist Stats API is running! Visit /api/stats to view stats.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
