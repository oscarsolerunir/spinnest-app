import { useState, useEffect, useRef } from 'react'
import { searchAlbums, getAlbumDetails } from '../../services/discogs'
import AlbumItem from './AlbumItem'
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

        const formattedResults = results.map(album => ({
          id: album.id,
          name: album.title,
          artist: 'Cargando...', // Se completará con getAlbumDetails
          year: album.year || 'Desconocido',
          genre: album.genre?.join(', ') || 'Desconocido',
          label: 'Cargando...', // Se completará con getAlbumDetails
          image: album.cover_image || ''
        }))

        setSearchResults(formattedResults)
        searchCache.current[artist] = formattedResults

        // 🔹 Obtener detalles completos para cada álbum
        formattedResults.forEach(async (album, index) => {
          try {
            const details = await getAlbumDetails(album.id)
            setSearchResults(prevResults =>
              prevResults.map((item, idx) =>
                idx === index
                  ? {
                      ...item,
                      artist: details.artist, // Ahora tenemos el artista correcto
                      label: details.label // Ahora tenemos el sello correcto
                    }
                  : item
              )
            )
          } catch (error) {
            console.error('❌ Error obteniendo detalles del álbum:', error)
          }
        })
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

    // Si los datos no están completos, obtenemos los detalles desde Discogs
    if (selectedAlbum.artist === 'Cargando...' || !selectedAlbum.tracklist) {
      console.log('🔍 Obteniendo detalles completos para el álbum:', id)
      const completeAlbum = await getAlbumDetails(id)

      // Reemplazar el álbum en `searchResults` con los datos completos
      setSearchResults(prevResults =>
        prevResults.map(album => (album.id === id ? completeAlbum : album))
      )

      console.log('✅ Datos completos obtenidos y reemplazados:', completeAlbum)

      // Guardar el álbum con datos completos
      handleSaveAlbum(completeAlbum)
      return
    }

    console.log(
      '✅ Álbum ya tenía todos los datos, guardando directamente:',
      selectedAlbum
    )
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
        <div>
          {searchResults.map(result => (
            <AlbumItem
              key={result.id}
              album={result}
              onClick={() => onSelectAlbum(result.id)}
              showCollectedBy={false}
              showDetailsLink={false}
            />
          ))}
        </div>
      )}
    </Form>
  )
}

export default AddAlbum
