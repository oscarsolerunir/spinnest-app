import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getAlbumById } from '../services/api'
import styled from 'styled-components'

const AlbumContainer = styled.div`
  padding: 16px;
  text-align: center;
  margin-bottom: 20px;
`

const AlbumImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 4px;
`

const AlbumTitle = styled.h3`
  margin: 10px 0;
`

const AlbumDetailsPage = ({ showCollectedBy = true }) => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const albumData = await getAlbumById(id)
        setAlbum(albumData)
      } catch (error) {
        console.error('Error fetching album:', error)
        setError('Error fetching album. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAlbum()
  }, [id])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  if (!album) {
    return <p>Album not found.</p>
  }

  return (
    <AlbumContainer>
      <AlbumImage src={album.image} alt={album.name} />
      <AlbumTitle>{album.name}</AlbumTitle>
      <p>{album.artist}</p>
      <p>{album.year}</p>
      <p>{album.genre}</p>
      <p>{album.label}</p>
      <p>{album.country}</p>
      <p>{album.released}</p>
      <p>{album.notes}</p>
      <p>
        {Array.isArray(album.formats)
          ? album.formats.join(', ')
          : album.formats}
      </p>
      <p>{album.lowest_price ? `$${album.lowest_price}` : 'N/A'}</p>
      <p>
        {Array.isArray(album.styles) ? album.styles.join(', ') : album.styles}
      </p>
      <p>Rating: {album.rating}</p>
      <p>Rating Count: {album.rating_count}</p>
      <p>Credits: {album.credits}</p>
      <a href={album.discogs_url} target="_blank" rel="noopener noreferrer">
        View on Discogs
      </a>
      <ol>
        {Array.isArray(album.tracklist)
          ? album.tracklist.map((track, index) => <li key={index}>{track}</li>)
          : album.tracklist}
      </ol>
      {album.videos?.length > 0 && (
        <div>
          <h4>Videos</h4>
          {album.videos.map((video, index) => (
            <div key={index}>
              <a href={video.uri} target="_blank" rel="noopener noreferrer">
                {video.title}
              </a>
            </div>
          ))}
        </div>
      )}
      {showCollectedBy && <p>Añadido por: {album.userNames.join(', ')}</p>}
    </AlbumContainer>
  )
}

export default AlbumDetailsPage
