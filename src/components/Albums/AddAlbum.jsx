import { useState, useEffect } from 'react'
import { searchAlbums, getAlbumDetails } from '../../services/discogs'
import ListAlbums from './ListAlbums'
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
      <h2>Search for albums by artist</h2>
      <Label>Artist:</Label>
      <Input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={e => setArtist(e.target.value)}
      />
      {searchResults.length > 0 && (
        <ListAlbums
          albums={searchResults.map(result => ({
            id: result.id,
            name: result.title,
            artist: result.artist,
            year: result.year,
            genre: result.genre,
            image: result.cover_image
          }))}
          confirmDeleteAlbum={null}
          onClick={onSelectAlbum}
          showCollectedBy={false} // No mostrar "Collected by: " en los resultados de búsqueda
        />
      )}
    </Form>
  )
}

export default AddAlbum
