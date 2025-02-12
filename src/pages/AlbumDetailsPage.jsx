import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAlbumById, deleteAlbumById } from '../services/api'
import { auth } from '../services/firebase'
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

const DeleteButton = styled.button`
  background-color: red;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: darkred;
  }
`

const AlbumDetailsPage = ({ showCollectedBy = true }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const currentUser = auth.currentUser
    if (currentUser) {
      setUserId(currentUser.uid)
    }

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

  const handleDeleteAlbum = async () => {
    const confirmDelete = window.confirm(
      '¿Seguro que quieres eliminar este álbum de tu colección?'
    )
    if (!confirmDelete) return

    try {
      await deleteAlbumById(id, userId)
      alert('Álbum eliminado correctamente.')
      navigate('/') // Redirigir al home después de eliminar
    } catch (error) {
      console.error('Error deleting album:', error)
      setError('Error deleting album. Please try again.')
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>
  if (!album) return <p>Álbum no encontrado.</p>

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
      {showCollectedBy && (
        <p>
          Añadido por: {album.userNames ? album.userNames.join(', ') : 'N/A'}
        </p>
      )}
      {showCollectedBy && (
        <p>
          En wishlist de:{' '}
          {album.wishlistUserNames ? album.wishlistUserNames.join(', ') : 'N/A'}
        </p>
      )}

      {/* Mostrar el botón solo si el usuario ha añadido el álbum */}
      {album.userIds.includes(userId) && (
        <DeleteButton onClick={handleDeleteAlbum}>
          Eliminar de mis álbumes
        </DeleteButton>
      )}
    </AlbumContainer>
  )
}

export default AlbumDetailsPage
