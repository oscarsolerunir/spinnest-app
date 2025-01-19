import axios from 'axios'

const DISCOGS_API_URL = 'https://api.discogs.com'
const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN

export const searchAlbums = async query => {
  try {
    const response = await axios.get(`${DISCOGS_API_URL}/database/search`, {
      params: {
        q: query,
        type: 'release'
      },
      headers: {
        Authorization: `Discogs token=${DISCOGS_TOKEN}`
      }
    })
    return response.data.results
  } catch (error) {
    console.error('Error searching albums:', error)
    throw error
  }
}

export const getAlbumDetails = async id => {
  try {
    const response = await axios.get(`${DISCOGS_API_URL}/releases/${id}`, {
      headers: {
        Authorization: `Discogs token=${DISCOGS_TOKEN}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error getting album details:', error)
    throw error
  }
}
