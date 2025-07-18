
const express = require('express');
const request = require('request');
const app = express();

// Spotify credentials from environment variables
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const token_url = 'https://accounts.spotify.com/api/token';

// Function to get an access token using the refresh token
function getAccessToken(callback) {
  const authOptions = {
    url: token_url,
    headers: {
      'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      callback(null, body.access_token);
    } else {
      callback(error || body);
    }
  });
}

// Stats endpoint for artist data
app.get('/stats', (req, res) => {
  getAccessToken((err, access_token) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve access token', details: err });
    }

    const options = {
      url: 'https://api.spotify.com/v1/artists/1XoUuYOyZEkGmYeCTaIWyj',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    request.get(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        res.json({
          name: body.name,
          followers: body.followers ? body.followers.total : 'N/A',
          popularity: body.popularity || 'N/A',
          genres: body.genres || [],
          spotify_url: body.external_urls ? body.external_urls.spotify : 'N/A'
        });
      } else {
        res.status(500).json({ error: 'Failed to fetch artist stats', details: body });
      }
    });
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('<h1>Spotify Artist Stats API is running!</h1><p>Visit <a href="/stats">/stats</a> to view artist stats.</p>');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
