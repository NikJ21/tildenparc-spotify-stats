
import fetch from 'node-fetch';

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  TILDEN_ARTIST_ID = '1XoUuYOyZEkGmYeCTaIWyj',
  TILDEN_MONTHLY_LISTENERS,
  TILDEN_TOTAL_STREAMS
} = process.env;

let cached = {
  token: null,
  expires: 0
};

async function getAccessToken() {
  const now = Date.now();
  if (cached.token && now < cached.expires) return cached.token;

  const creds = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) throw new Error('Failed to get Spotify access token');

  const data = await res.json();
  cached.token = data.access_token;
  cached.expires = now + (data.expires_in - 60) * 1000;
  return cached.token;
}

async function getArtist(artistId) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to fetch artist data');
  return res.json();
}

export default async function handler(req, res) {
  try {
    const artist = await getArtist(TILDEN_ARTIST_ID);

    const payload = {
      name: artist.name,
      followers: artist.followers?.total ?? null,
      popularity: artist.popularity ?? null,
      image: artist.images?.[0]?.url ?? null,
      spotifyUrl: artist.external_urls?.spotify ?? null,
      monthly_listeners: TILDEN_MONTHLY_LISTENERS || null,
      total_streams: TILDEN_TOTAL_STREAMS || null,
      last_updated: new Date().toISOString()
    };

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    res.status(200).json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
