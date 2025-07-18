
import fetch from "node-fetch";
import cheerio from "cheerio";

// Tilden Parc Artist ID
const ARTIST_ID = "3GjbpcGv2AIvBaWHZkmp94";
const SPOTIFY_ARTIST_URL = "https://open.spotify.com/artist/" + ARTIST_ID;

// Environment variables for Spotify API
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Get Spotify API access token
async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

// Fetch artist data from Spotify API
async function getArtistData() {
  const token = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${ARTIST_ID}`,
    {
      headers: { Authorization: "Bearer " + token },
    }
  );
  return await response.json();
}

// Fetch top tracks
async function getTopTracks() {
  const token = await getAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${ARTIST_ID}/top-tracks?market=US`,
    {
      headers: { Authorization: "Bearer " + token },
    }
  );
  return await response.json();
}

// Scrape monthly listeners from artist page
async function getMonthlyListeners() {
  try {
    const res = await fetch(SPOTIFY_ARTIST_URL);
    const html = await res.text();
    const $ = cheerio.load(html);
    const text = $('meta[property="og:description"]').attr("content");
    const match = text.match(/(\d[\d,]*) monthly listeners/);
    return match ? match[1] : "N/A";
  } catch (err) {
    console.error("Error scraping monthly listeners:", err);
    return "N/A";
  }
}

// API handler for Vercel
export default async function handler(req, res) {
  try {
    const artist = await getArtistData();
    const topTracks = await getTopTracks();
    const monthlyListeners = await getMonthlyListeners();
    res.status(200).json({
      name: artist.name,
      followers: artist.followers.total,
      popularity: artist.popularity,
      monthlyListeners,
      topTracks: topTracks.tracks.map((track) => ({
        name: track.name,
        url: track.external_urls.spotify,
        plays: track.popularity,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching artist data");
  }
}
