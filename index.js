
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    const artistId = '3GjbpcGv2AIvBaWHZkmp94'; // Your artist ID

    // Step 1: Get a new access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error('Failed to refresh access token');

    // Step 2: Get artist data
    const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const artistData = await artistResponse.json();

    // Step 3: Return a simple HTML page with a button
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
      <html>
        <head>
          <title>Tilden Parc Spotify Stats</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Spotify Stats</h1>
          <button style="padding: 10px 20px; font-size: 16px;" onclick="fetchStats()">Show Stats</button>
          <div id="stats" style="margin-top: 20px;"></div>
          <script>
            function fetchStats() {
              const stats = ${JSON.stringify(artistData)};
              document.getElementById('stats').innerHTML = 
                '<p><b>Artist:</b> ' + stats.name + '</p>' +
                '<p><b>Followers:</b> ' + stats.followers.total + '</p>' +
                '<p><b>Genres:</b> ' + stats.genres.join(', ') + '</p>';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).json({ error: 'Cannot get stats', details: error.message });
  }
};
