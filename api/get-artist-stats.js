const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const ARTIST_ID = '3GjbpcGv2AIvBaWHZkmp94';

async function getAccessToken() {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: REFRESH_TOKEN,
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.message);
        throw new Error('Could not get access token');
    }
}

async function getArtistStats(accessToken) {
    const url = `https://api.spotify.com/v1/artists/${ARTIST_ID}`;
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('artist stats');
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching artist stats:', error.response ? error.response.data : error.message);
        throw new Error('Could not fetch artist stats');
    }
}

async function getMonthlyListeners(artistId) {
    const url = `https://spotify-artist-monthly-listeners.p.rapidapi.com/artists/spotify_artist_monthly_listeners?spotify_artist_id=${artistId}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-host': 'spotify-artist-monthly-listeners.p.rapidapi.com',
                'x-rapidapi-key': process.env.RAPIDAPI_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('monthly listeners data');
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching monthly listeners:', error.message);
        throw new Error('Could not fetch monthly listeners');
    }
}

export default async function handler(req, res) {
    try {
        const accessToken = await getAccessToken();
        const stats = await getArtistStats(accessToken);
        const monthlyListeners = await getMonthlyListeners(ARTIST_ID);

        res.status(200).json({
            artist: stats.name,
            followers: stats.followers.total,
            genres: stats.genres,
            popularity: stats.popularity,
            spotify_url: stats.external_urls.spotify,
            monthly_listeners: monthlyListeners.monthly_listeners
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch artist stats', error: error.message });
    }
};
