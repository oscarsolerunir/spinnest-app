import { useState, useEffect, useRef } from 'react'
import { searchAlbums, getAlbumDetails } from '../../services/discogs'
import AlbumsList from '../Albums/AlbumsList'
import styled from 'styled-components'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
`

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`

const Input = styled.input`
  margin-bottom: 16px;
  padding: 8px;
  font-size: 16px;
`

const AddAlbum = ({ handleSaveAlbum }) => {
  const [artist, setArtist] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchCache = useRef({})

  useEffect(() => {
    const fetchAlbums = async () => {
      if (artist.length < 3) {
        setSearchResults([])
        setError(null)
        return
      }

      if (searchCache.current[artist]) {
        console.log('🔄 Usando caché para:', artist)
        setSearchResults(searchCache.current[artist])
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log('🔍 Buscando álbumes en Discogs para:', artist)
        const results = await searchAlbums(artist)
        console.log('📀 Resultados de búsqueda:', results)

        let formattedResults = results.map(album => ({
          id: album.id,
          name: album.title,
          artist: 'Cargando...',
          year: album.year || 'Desconocido',
          genre: album.genre?.join(', ') || 'Desconocido',
          label: 'Cargando...',
          image: album.cover_image || ''
        }))

        const detailedResults = await Promise.all(
          formattedResults.map(async album => {
            try {
              const details = await getAlbumDetails(album.id)
              return { ...album, ...details }
            } catch (error) {
              console.error(
                `❌ Error obteniendo detalles del álbum ${album.id}:`,
                error
              )
              return album
            }
          })
        )

        setSearchResults(detailedResults)
        searchCache.current[artist] = detailedResults
      } catch (error) {
        console.error('❌ Error buscando álbumes:', error)
        setError(
          'Demasiadas peticiones a Discogs. Intenta de nuevo en unos segundos.'
        )
      } finally {
        setLoading(false)
      }
    }

    const delaySearch = setTimeout(fetchAlbums, 1000)
    return () => clearTimeout(delaySearch)
  }, [artist])

  const onSelectAlbum = async id => {
    let selectedAlbum = searchResults.find(album => album.id === id)
    if (!selectedAlbum) return

    console.log(
      '🔄 Verificando si el álbum tiene todos los datos antes de guardar...',
      selectedAlbum
    )

    if (
      selectedAlbum.artist === 'Cargando...' ||
      !selectedAlbum.tracklist ||
      selectedAlbum.tracklist.length === 0 ||
      !selectedAlbum.country ||
      !selectedAlbum.discogs_url ||
      !selectedAlbum.formats ||
      selectedAlbum.formats.length === 0
    ) {
      console.log('🔍 Obteniendo detalles completos para el álbum:', id)
      try {
        const albumDetails = await getAlbumDetails(id)
        selectedAlbum = { ...selectedAlbum, ...albumDetails }
      } catch (error) {
        console.error('❌ No se pudo obtener detalles del álbum:', id, error)
        return
      }
    }

    console.log('✅ Álbum listo para guardar en Firebase:', selectedAlbum)
    handleSaveAlbum(selectedAlbum)
  }

  return (
    <Form>
      <h2>Buscar álbumes por artista</h2>
      <Label>Artista:</Label>
      <Input
        type="text"
        placeholder="Nombre del artista"
        value={artist}
        onChange={e => setArtist(e.target.value)}
      />
      {loading && <p>🔄 Cargando resultados...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {searchResults.length > 0 && (
        <AlbumsList
          albums={searchResults}
          showCollectedBy={false}
          showDetailsLink={false}
          onAlbumClick={onSelectAlbum}
        />
      )}
    </Form>
  )
}

export default AddAlbum
