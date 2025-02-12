import { useState, useEffect } from 'react'
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
      console.log('📀 Detalles del álbum:', albumDetails) // Debugging log

      handleSaveAlbum({
        albumTitle: albumDetails.title || 'Desconocido',
        albumArtist: albumDetails.artists_sort || 'Desconocido',
        albumYear: albumDetails.year || 'Desconocido',
        albumGenre: albumDetails.genres?.join(', ') || 'Desconocido',
        albumLabel:
          albumDetails.labels?.map(label => label.name).join(', ') ||
          'Desconocido',
        albumImage: albumDetails.images?.[0]?.uri || '',
        albumCountry: albumDetails.country || 'Desconocido',
        albumReleased: albumDetails.released || 'Desconocido',
        albumNotes: albumDetails.notes || 'Sin notas',
        albumFormats:
          albumDetails.formats?.map(format => format.name).join(', ') ||
          'Desconocido',
        albumLowestPrice: albumDetails.lowest_price || 0,
        albumTracklist:
          albumDetails.tracklist?.map(track => track.title).join(', ') ||
          'No disponible',
        albumVideos:
          albumDetails.videos?.map(video => ({
            title: video.title,
            uri: video.uri
          })) || [],
        albumStyles: albumDetails.styles?.join(', ') || 'Desconocido',
        albumRating: albumDetails.community?.rating?.average || 0,
        albumRatingCount: albumDetails.community?.rating?.count || 0,
        albumCredits:
          albumDetails.extraartists?.map(artist => artist.name).join(', ') ||
          'No disponible',
        albumDiscogsUrl: albumDetails.uri || ''
      })
    } catch (error) {
      console.error('❌ Error getting album details:', error)
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
        <div>
          {searchResults.map(result => (
            <AlbumItem
              key={result.id}
              album={{
                id: result.id,
                name: result.title,
                artist: result.artist,
                year: result.year,
                genre: result.genre,
                image: result.cover_image
              }}
              userAlbumIds={[]} // No user albums in search results
              wishlist={[]} // No wishlist in search results
              handleAddToWishlist={() => {}}
              handleRemoveFromWishlist={() => {}}
              onClick={onSelectAlbum}
              showCollectedBy={false} // No mostrar "Collected by: " en los resultados de búsqueda
              showDetailsLink={false} // No mostrar "Ver detalles" en los resultados de búsqueda
            />
          ))}
        </div>
      )}
    </Form>
  )
}

export default AddAlbum
