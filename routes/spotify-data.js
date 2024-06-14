import express from 'express'
import axios from 'axios'
import { getLatestSongs, addLatestSong } from '../firebase.js'
import { SPOTIFY_URL } from '../utils/constants.js'

const authRouter = await import('./auth.js')

const router = express.Router()

router.get('/track', (req, res, next) => {
  try {
    axios({
      method: 'get',
      url: `${SPOTIFY_URL}/tracks/${req.query.trackID}`,
      headers: {
        Authorization: 'Bearer ' + authRouter.accessToken,
      },
    }).then((response) => {
      const artists = []
      for (let artist of response.data.artists) {
        artists.push({ name: artist.name, id: artist.id })
      }
      const track = {
        artists: artists,
        name: response.data.name,
        url: response.data.preview_url,
      }
      res.status(200).send(track)
    })
  } catch (error) {
    next(error)
  }
})

router.get('/searchAlbums', async (req, res, next) => {
  try {
    const requestedData = await axios({
      method: 'get',
      url: `${SPOTIFY_URL}/search?q=${req.query.q}&offset=${req.query.offset}&limit=${req.query.limit}&type=album&market=GB`,
      headers: {
        Authorization: 'Bearer ' + authRouter.accessToken,
      },
    })

    let foundAlbums = []
    const albums = requestedData.data.albums
    for (let item of albums.items) {
      const { artists, id: albumID, images } = item
      const mappedArtists = artists.map((artist) => {
        return {
          artistID: artist.id,
          name: artist.name,
        }
      })
      foundAlbums.push({
        name: item.name,
        artists: mappedArtists,
        albumID,
        image: images[0],
      })
    }
    res
      .status(200)
      .send({ foundAlbums, total: albums.total, offset: req.query.offset })
  } catch (error) {
    next(error)
  }
})

router.get('/searchTracks', async (req, res, next) => {
  try {
    const requestedData = await axios({
      method: 'get',
      url: `${SPOTIFY_URL}/search?q=${req.query.q}&offset=${req.query.offset}&limit=${req.query.limit}&type=track&market=GB`,
      headers: {
        Authorization: 'Bearer ' + authRouter.accessToken,
      },
    })

    let totalTracks = requestedData.data.tracks.total
    let foundTracks = []
    const tracks = requestedData.data.tracks
    for (let item of tracks.items) {
      const { artists, id: trackID, name, preview_url } = item
      const mappedArtists = artists.map((artist) => {
        return {
          artistID: artist.id,
          name: artist.name,
        }
      })
      let formattedTrack = {
        name,
        artists: mappedArtists,
        trackID,
        song: preview_url,
        album: {
          albumID: item.album.id,
          albumName: item.album.name,
        },
      }
      if (item.album.images) {
        formattedTrack = { ...formattedTrack, image: item.album.images[0] }
      }
      foundTracks.push(formattedTrack)
    }
    res
      .status(200)
      .send({ foundTracks, total: totalTracks, offset: req.query.offset })
  } catch (error) {
    next(error)
  }
})

router.get('/album', async (req, res, next) => {
  try {
    const requestedData = await axios({
      method: 'get',
      url: `${SPOTIFY_URL}/albums/${req.query.albumID}`, //?market=GB
      headers: {
        Authorization: 'Bearer ' + authRouter.accessToken,
      },
    })

    let formattedTracks = []
    const album = requestedData.data
    const { name, id, artists, tracks, images } = album
    const mappedArtists = artists.map((artist) => {
      return {
        artistID: artist.id,
        name: artist.name,
      }
    })

    for (let item of tracks.items) {
      const { id: trackID, name: trackName, preview_url } = item
      let formattedTrack = {
        name: trackName,
        trackID,
        song: preview_url,
        album: {
          albumID: id,
          albumName: name,
        },
      }

      if (images) {
        formattedTrack = { ...formattedTrack, image: images[0] }
      }
      formattedTracks.push(formattedTrack)
    }
    res.status(200).send({
      albumID: req.query.albumID,
      name,
      image: images[0],
      artists: mappedArtists,
      tracks: formattedTracks,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/releaseAlbum', async (req, res, next) => {
  try {
    const requestedData = await axios({
      method: 'get',
      url: `${SPOTIFY_URL}/browse/new-releases?limit=5&offset=0`,
      headers: {
        Authorization: 'Bearer ' + authRouter.accessToken,
      },
    })
    const randomIndex = Math.floor(Math.random() * 5)

    const album = requestedData.data.albums.items[randomIndex]
    const { name, id, artists, images } = album
    const mappedArtists = artists.map((artist) => {
      return {
        artistID: artist.id,
        name: artist.name,
      }
    })

    res.status(200).send({
      albumID: id,
      name: name,
      image: images[0]?.url,
      artists: mappedArtists,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/artist', (req, res, next) => {
  try {
    spotifyApi.getArtist(req.query.artistID).then(
      (data) => {
        console.log('Artist information', data)
      },
      (err) => {
        console.error(err)
      }
    )
  } catch (error) {
    next(error)
  }
})

router.get('/latestSongs', async (req, res, next) => {
  try {
    const songs = await getLatestSongs()
    res.status(200).send(songs)
  } catch (error) {
    next(error)
  }
})

router.post('/addLatestSong', async (req, res, next) => {
  await addLatestSong(req.body)
  res.status(200).json({ message: 'Song added. ', track: req.body })
})
export default router
