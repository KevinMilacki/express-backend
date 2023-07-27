const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require('axios')

const app = express();
const PORT = 3001;
const apiRouter = express.Router();

let spotifyToken;
const googletoken = process.env.GOOGLE_API_KEY;

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

apiRouter.get("/spotifykey", function (req, res) {
  
  res.send(spotifyToken);
});

apiRouter.get("/googlekey", function (req, res) {
 
  res.send(googletoken);
});

apiRouter.get('/distance', async (req, res) => {
  try {
    const { originLat, originLng, destinationLat, destinationLng } = req.query;

    if (!originLat || !originLng || !destinationLat || !destinationLng) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originLat},${originLng}&destinations=${destinationLat},${destinationLng}&key=${googletoken}`;

    const response = await axios.get(googleMapsApiUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Google Maps API:', error.message);
    res.status(500).json({ error: 'Error fetching data from Google Maps API' });
  }
});

apiRouter.get('/latlng', async (req, res) => {
  try {
    const { address, placeId } = req.query;

    if (!address && !placeId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let googleMapsApiUrl;
    if (placeId) {
      // If placeId is provided, fetch the details using placeId
      googleMapsApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googletoken}`;
    } else {
      // If address is provided, fetch the details using address
      googleMapsApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googletoken}`;
    }

    const response = await axios.get(googleMapsApiUrl);
    const data = response.data;

    if (data && data.status === 'OK') {
      const { lat, lng } = data.results[0].geometry.location;
      res.json({ latlng: { lat, lng } });
    } else {
      console.log('Error fetching latitude and longitude from Google Maps API.');
      res.status(500).json({ error: 'Error fetching latitude and longitude from Google Maps API' });
    }
  } catch (error) {
    console.error('Error fetching latitude and longitude from Google Maps API:', error.message);
    res.status(500).json({ error: 'Error fetching latitude and longitude from Google Maps API' });
  }
});

app.use("/api", apiRouter);

app.listen(PORT, () => {
  console.log(`Sever is running on port ${PORT}`);

});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});



app.use(express.static("../frontend"));

setTimeout(() => {
  console.log(spotifyToken);
  console.log(googletoken);
}, 3000);
