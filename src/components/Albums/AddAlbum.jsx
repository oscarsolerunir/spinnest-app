import { useState, useEffect, useRef } from 'react'
import { searchAlbums, getAlbumDetails } from '../../services/discogs'
import AlbumsList from '../Albums/AlbumsList'

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
        setSearchResults(searchCache.current[artist])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const results = await searchAlbums(artist)

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
            } catch {
              return album
            }
          })
        )

        setSearchResults(detailedResults)
        searchCache.current[artist] = detailedResults
      } catch {
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

    if (
      selectedAlbum.artist === 'Cargando...' ||
      !selectedAlbum.tracklist ||
      selectedAlbum.tracklist.length === 0 ||
      !selectedAlbum.country ||
      !selectedAlbum.discogs_url ||
      !selectedAlbum.formats ||
      selectedAlbum.formats.length === 0
    ) {
      try {
        const albumDetails = await getAlbumDetails(id)
        selectedAlbum = { ...selectedAlbum, ...albumDetails }
      } catch {
        return
      }
    }

    handleSaveAlbum(selectedAlbum)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <form className="flex flex-col mx-auto">
      <h2 className="text-xl font-medium mb-4">
        Busca álbumes por artista o álbum
      </h2>
      <label className="mb-2 font-medium">Artista o álbum:</label>
      <input
        type="text"
        placeholder="Nombre del artista o del álbum"
        value={artist}
        onChange={e => setArtist(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-4 p-4 text-lg border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
      />
      {loading && <p>🔄 Cargando resultados...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {searchResults.length > 0 && (
        <AlbumsList
          albums={searchResults}
          showCollectedBy={false}
          showDetailsLink={false}
          onAlbumClick={onSelectAlbum}
        />
      )}
    </form>
  )
}

export default AddAlbum
