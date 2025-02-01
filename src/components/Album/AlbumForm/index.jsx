import { useState, useEffect } from 'react'
import { Form, Label, Input } from './styles'
import { searchAlbums, getAlbumDetails } from '../../../services/discogs'
import AlbumList from '../../Album/AlbumList'

const AlbumForm = ({ handleSaveAlbum }) => {
  const [artist, setArtist] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    const fetchAlbums = async () => {
      if (artist.length >= 3) {
        try {
          const results = await searchAlbums(artist)
          setSearchResults(results)
        } catch (error) {
          console.error('Error searching albums:', error)
        }
      } else {
        setSearchResults([])
      }
    }

    fetchAlbums()
  }, [artist])

  const onSelectAlbum = async id => {
    try {
      const albumDetails = await getAlbumDetails(id)
      handleSaveAlbum({
        albumTitle: albumDetails.title,
        albumArtist: albumDetails.artists_sort,
        albumYear: albumDetails.year,
        albumGenre: albumDetails.genres.join(', '),
        albumLabel: albumDetails.labels.map(label => label.name).join(', '),
        albumImage: albumDetails.images[0]?.uri
      })
    } catch (error) {
      console.error('Error getting album details:', error)
    }
  }

  return (
    <Form>
      <Label>Busca tu álbum por el nombre del artista</Label>
      <Input
        type="text"
        placeholder="Escribe aquí el nombre del artista"
        value={artist}
        onChange={e => setArtist(e.target.value)}
      />
      {searchResults.length > 0 && (
        <AlbumList
          albums={searchResults.map(result => ({
            id: result.id,
            name: result.title,
            artist: result.artist,
            year: result.year,
            genre: result.genre,
            image: result.cover_image
          }))}
          onClick={onSelectAlbum}
          context="upload-album" // Pasar el contexto correcto
        />
      )}
    </Form>
  )
}

export default AlbumForm
