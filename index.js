const express = require("express");
require('dotenv').config();


const app = express();
const PORT = 3001 
const apiRouter = express.Router();


let spotifyToken

const spotifyTokenGet = () => {
    const authParameters = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&client_id=' + process.env.SPOTIFY_CLIENT_ID + '&client_secret=' + process.env.SPOTIFY_CLIENT_SECRET
    }

    fetch('https://accounts.spotify.com/api/token', authParameters)
    .then(result => result.json())
    .then(data => 
        {spotifyToken = data.access_token;
        });    
}

spotifyTokenGet();


apiRouter.get('/test', function (req, res) {
    console.log(`Hello`);
    res.send(spotifyToken);
})

app.use('/api', apiRouter)

app.listen(PORT, () => {
    console.log(`Sever is running on port ${PORT}`);
});


app.use(express.static('../frontend'));

setTimeout(() => {
    console.log(spotifyToken);
  }, 3000);
  