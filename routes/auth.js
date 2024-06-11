import express from 'express'
import axios from 'axios'
import SpotifyWebApi from 'spotify-web-api-node'

const router = express.Router()
const scopes = ['user-read-private', 'user-read-email'] // you need to add a scope, it depends on your API call
const state = 'what-ever-your-state'
export var accessToken
export var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: `http://localhost:3000/callback`, // my redirectURL is `localhost:3000/callback`
})

router.get('/access', async (req, res) => {
  await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer.from(
          process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: {
      grant_type: 'client_credentials',
    },
  })
    .then((response) => {
      if (response.status === 200) {
        accessToken = response.data.access_token
        res.status(200).send(response.data.expires_in.toString())
      } else {
        console.log('Request failed with status code 401')
      }
    })
    .catch((error) => res.status(500).send({ error: `Error:${error}` }))
})

export default router
