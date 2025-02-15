import axios from 'axios'

const DISCOGS_API_URL = 'https://api.discogs.com'
const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN

export const searchAlbums = async (query, page = 1, perPage = 10) => {
  try {
    console.log('🔍 Buscando álbumes en Discogs:', query)

    const response = await axios.get(`${DISCOGS_API_URL}/database/search`, {
      params: {
        q: query,
        type: 'release',
        token: DISCOGS_TOKEN,
        page,
        per_page: perPage // 🔹 Limitamos a 10 resultados por página
      }
    })

    console.log('📀 Resultados obtenidos:', response.data)
    return response.data.results
  } catch (error) {
    console.error('❌ Error buscando álbumes:', error)

    if (error.response?.status === 429) {
      console.warn(
        '⚠️ Discogs está limitando las peticiones. Reintentando en 5 segundos...'
      )
      return new Promise(resolve => {
        setTimeout(async () => {
          const result = await searchAlbums(query, page, perPage)
          resolve(result)
        }, 5000) // 🔹 Esperar 5 segundos antes de reintentar
      })
    }

    return []
  }
}

export const getAlbumDetails = async id => {
  try {
    console.log('🔍 Obteniendo detalles de Discogs para ID:', id)

    const response = await axios.get(`${DISCOGS_API_URL}/releases/${id}`, {
      headers: { Authorization: `Discogs token=${DISCOGS_TOKEN}` }
    })

    const data = response.data

    console.log('📀 Respuesta completa de Discogs:', data) // 🔍 Verificar respuesta completa

    // 🔹 Extraer y verificar los datos antes de devolverlos
    const albumDetails = {
      id: data.id,
      name: data.title || 'Desconocido',
      artist: data.artists_sort || data.artists?.[0]?.name || 'Desconocido',
      year: data.year?.toString() || 'Desconocido',
      genre: data.genres?.join(', ') || 'Desconocido',
      label: data.labels?.map(label => label.name).join(', ') || 'Desconocido',
      country: data.country || 'Desconocido',
      released: data.released || 'Desconocido',
      notes: data.notes || 'Sin notas',
      formats: data.formats?.map(format => format.name) || [],
      lowest_price: data.lowest_price || 0,
      tracklist: data.tracklist?.map(track => track.title) || [],
      styles: data.styles || [],
      rating: data.community?.rating?.average || 0,
      rating_count: data.community?.rating?.count || 0,
      credits:
        data.extraartists?.map(credit => credit.name).join(', ') ||
        'No disponible',
      discogs_url: data.uri || '',
      videos:
        data.videos?.map(video => ({ title: video.title, uri: video.uri })) ||
        [],
      image:
        data.images?.find(img => img.type === 'primary')?.uri ||
        data.images?.[0]?.uri ||
        '',
      all_images: data.images?.map(img => img.uri) || []
    }

    console.log(
      '📀 Datos extraídos de Discogs antes de devolver:',
      albumDetails
    ) // 🔍 Verificar datos finales

    return albumDetails
  } catch (error) {
    console.error('❌ Error obteniendo detalles del álbum:', error)

    if (error.response?.status === 429) {
      console.warn(
        '⚠️ Discogs está limitando las peticiones. Reintentando en 5 segundos...'
      )
      return new Promise(resolve => {
        setTimeout(async () => {
          const result = await getAlbumDetails(id)
          resolve(result)
        }, 5000)
      })
    }

    return null
  }
}
