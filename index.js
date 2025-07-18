
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Your Artist ID
const ARTIST_ID = "3GjbpcGv2AIvBaWHZkmp94";

// Spotify API credentials (from your Spotify Developer App)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Function to get access token
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

// Function to fetch artist data
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

// Function to fetch top tracks
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

// API endpoint for EPK
app.get("/artist-stats", async (req, res) => {
  try {
    const artist = await getArtistData();
    const topTracks = await getTopTracks();
    res.json({
      name: artist.name,
      followers: artist.followers.total,
      popularity: artist.popularity,
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
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
