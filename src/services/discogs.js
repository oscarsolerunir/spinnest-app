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
    console.log('🔍 Obteniendo detalles de Discogs para ID:', id)

    const response = await axios.get(`${DISCOGS_API_URL}/releases/${id}`, {
      headers: {
        Authorization: `Discogs token=${DISCOGS_TOKEN}`
      }
    })

    const data = response.data

    console.log('📀 Respuesta completa de Discogs:', data)

    return {
      id: data.id,
      name: data.title || 'Desconocido',
      artist: data.artists_sort || data.artists?.[0]?.name || 'Desconocido',
      year: data.year || 'Desconocido',
      genre: data.genres?.join(', ') || 'Desconocido',
      label: data.labels?.[0]?.name || 'Sello desconocido', // 🔹 Tomar el primer sello
      image: data.images?.[0]?.uri || '',
      country: data.country || 'Desconocido',
      released: data.released || 'Desconocido',
      notes: data.notes || 'Sin notas',
      tracklist: data.tracklist?.map(track => track.title) || [],
      styles: data.styles?.join(', ') || [],
      rating: data.community?.rating?.average || 0,
      rating_count: data.community?.rating?.count || 0,
      discogs_url: data.uri || ''
    }
  } catch (error) {
    console.error('❌ Error obteniendo detalles del álbum:', error)
    throw error
  }
}
