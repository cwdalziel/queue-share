const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');

const port = 5000

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var app = express();

app.get('/auth/login', (req, res) => {

    var scope = "streaming \
                 user-read-email \
                 user-read-private \
                 user-read-playback-state \
                 user-modify-playback-state"

    var state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: "http://localhost:3000/auth/callback",
        state: state
    })

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

app.get('/auth/callback', (req, res) => {

    var code = req.query.code;

    var data = {
        code: code,
        redirect_uri: "http://localhost:3000/auth/callback",
        grant_type: 'authorization_code'
    }

    axios.post('https://accounts.spotify.com/api/token', data, {
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((response) => {
        access_token = response.data.access_token;
        res.redirect('/')
    })

});

app.get('/auth/token', (req, res) => {
    res.json(
        {
            access_token: access_token
        })
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
});
