const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require('axios')

const app = express();
const PORT = 3001;
const apiRouter = express.Router();

let spotifyToken;

app.use(
  cors({
    origin: "http://localhost:3000", 
  })
);

const spotifyTokenGet = () => {
  const authParameters = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&client_id=" +
      process.env.SPOTIFY_CLIENT_ID +
      "&client_secret=" +
      process.env.SPOTIFY_CLIENT_SECRET,
  };

  fetch("https://accounts.spotify.com/api/token", authParameters)
    .then((result) => result.json())
    .then((data) => {
      spotifyToken = data.access_token;
    });
};

spotifyTokenGet();

apiRouter.get("/test", function (req, res) {
  console.log(`Hello`);
  res.send(spotifyToken);
});

app.get('/places', async (req, res) => {
  const apiKey = process.env.PLACES_API_KEY;
  const { query } = req.query;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query,
        key: apiKey,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'An error occurred while fetching places' });
  }
});

app.get('/distance-matrix', async (req, res) => {
  const apiKey = process.env.DISTANCE_MATRIX_API_KEY;
  const { origins, destinations } = req.query;

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins,
        destinations,
        key: apiKey,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching distance matrix:', error);
    res.status(500).json({ error: 'An error occurred while fetching distance matrix' });
  }
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Sever is running on port ${PORT}`);
});

app.use(express.static("../frontend"));

setTimeout(() => {
  console.log(spotifyToken);
}, 3000);
