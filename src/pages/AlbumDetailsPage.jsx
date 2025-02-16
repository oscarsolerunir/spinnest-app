import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAlbumById, deleteAlbumById } from '../services/api'
import { auth } from '../services/firebase'

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
        if (!albumData) {
          throw new Error('Álbum no encontrado en Firestore')
        }
        setAlbum(albumData)
      } catch {
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
      navigate('/albums') // Redirigir al home después de eliminar
    } catch {
      setError('Error deleting album. Please try again.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!album) return <p>Álbum no encontrado.</p>

  return (
    <div className="p-4 text-center mb-5">
      <img
        src={album.image}
        alt={album.name}
        className="max-w-full h-auto rounded"
      />
      <h3 className="my-2">{album.name}</h3>
      <p>{album.artist || 'Artista desconocido'}</p>
      <p>{album.year || 'Año desconocido'}</p>
      <p>{album.genre || 'Género desconocido'}</p>
      <p>{album.label || 'Sello desconocido'}</p>
      <p>{album.country || 'País desconocido'}</p>
      <p>{album.released || 'Fecha de lanzamiento desconocida'}</p>
      <p>{album.notes || 'Sin notas'}</p>
      <p>
        {Array.isArray(album.formats)
          ? album.formats.join(', ')
          : album.formats || 'Formato desconocido'}
      </p>
      <p>
        {album.lowest_price ? `$${album.lowest_price}` : 'Precio no disponible'}
      </p>
      <p>
        {Array.isArray(album.styles)
          ? album.styles.join(', ')
          : album.styles || 'Estilos no disponibles'}
      </p>
      <p>Rating: {album.rating || 'Sin rating'}</p>
      <p>Rating Count: {album.rating_count || 0}</p>
      <p>Credits: {album.credits || 'Créditos no disponibles'}</p>
      <a href={album.discogs_url} target="_blank" rel="noopener noreferrer">
        View on Discogs
      </a>
      <ol>
        {Array.isArray(album.tracklist)
          ? album.tracklist.map((track, index) => <li key={index}>{track}</li>)
          : 'Sin lista de pistas'}
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

      {album.userIds?.includes(userId) && (
        <button
          onClick={handleDeleteAlbum}
          className="mt-5 bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Eliminar de mis álbumes
        </button>
      )}
    </div>
  )
}

export default AlbumDetailsPage
