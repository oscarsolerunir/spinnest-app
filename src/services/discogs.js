import axios from 'axios'

const DISCOGS_API_URL = 'https://api.discogs.com'
const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN

export const searchAlbums = async query => {
  try {
    console.log('Searching albums with query:', query)
    const response = await axios.get(`${DISCOGS_API_URL}/database/search`, {
      params: {
        q: query,
        type: 'release',
        token: DISCOGS_TOKEN
      }
    })
    console.log('Discogs search response:', response)
    const albumResults = response.data.results
    return albumResults
  } catch (error) {
    console.error('Error searching albums:', error)
    throw error
  }
}

export const getAlbumDetails = async id => {
  try {
    console.log('Getting album details for id:', id)
    const response = await axios.get(`${DISCOGS_API_URL}/releases/${id}`, {
      headers: {
        Authorization: `Discogs token=${DISCOGS_TOKEN}`
      }
    })
    console.log('Discogs album details response:', response)
    return response.data
  } catch (error) {
    console.error('Error getting album details:', error)
    throw error
  }
}
