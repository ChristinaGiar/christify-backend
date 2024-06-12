import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import spotifyRoutes from './routes/spotify-data.js'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'

dotenv.config()
let app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

const errorHandler = (error, req, res) => {
  console.log(`Error ${error.message}`)
  const status = error.status || 400
  res.status(status).send({ error: error.message })
}

app.use(authRouter)
app.use(spotifyRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || process.env.LOCAL_PORT
app.listen(PORT, () => {
  console.log(`Christify backend listening on port ${PORT}`)
})
