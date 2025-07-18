const express = require('express');
const request = require('request');
const app = express();

// Use hidden environment variables (set these in Vercel or Replit)
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// Use Vercel (or Replit) callback URL
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'https://nodejs.nikwjackson.repl.co/callback';

// Root route with a login link
app.get('/', (req, res) => {
  res.send('<a href="/login">Click here to log in with Spotify</a>');
});

// Login route to Spotify OAuth
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email';
  const auth_url =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri
    }).toString();

  res.redirect(auth_url);
});

// Callback route for Spotify
app.get('/callback', (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('<h2>Missing authorization code from Spotify</h2>');
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const refresh_token = body.refresh_token;
      res.send(`<h2>✅ Success!</h2><p>Your Spotify Refresh Token is:</p><code>${refresh_token}</code>`);
    } else {
      res.status(500).send('<h2>❌ Failed to retrieve refresh token.</h2><p>Check your credentials and redirect URI.</p>');
    }
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
