import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
dotenv.config()

initializeApp({
  credential: cert(JSON.parse(process.env.CHRISTIFY_KEY)),
})

const db = getFirestore()

// Save data
export const addLatestSong = async (song) => {
  const docName = song.trackID
  const currentUTCTime = new Date().toUTCString()
  const currentISOTime = new Date(currentUTCTime).getTime()
  await db.collection('songs').doc(docName).delete() // delete if the same song exists
  const docRef = db.collection('songs').doc(docName)
  await docRef.set({ ...song, timestamp: currentISOTime })
}

// Get Data
export const getLatestSongs = async () => {
  let songs = []

  const snapshot = await db
    .collection('songs')
    .orderBy('timestamp', 'desc')
    .get()
  snapshot.forEach((doc) => songs.push(doc.data()))

  return songs
}
