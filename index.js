const express = require('express');
const request = require('request');
const path = require('path');
const app = express();

// Load Spotify credentials from environment variables
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'https://tildenparc-spotify-stats.vercel.app/callback';

// Root route with login link
app.get('/', (req, res) => {
  res.send(`<h3>Click <a href="/login">here</a> to log in with Spotify.</h3>`);
});

// Start Spotify OAuth flow
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email';
  const auth_url =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
    }).toString();

  res.redirect(auth_url);
});

// Handle callback and retrieve refresh token
app.get('/callback', (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('<h2>Missing authorization code from Spotify.</h2>');
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const refresh_token = body.refresh_token;
      res.send(`<h2>✅ Success!</h2><p>Your Spotify Refresh Token:</p><code>${refresh_token}</code>`);
    } else {
      console.error('Error retrieving token:', error || body);
      res.status(500).send('<h2>❌ Failed to retrieve refresh token.</h2>');
    }
  });
});

// Launch server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
