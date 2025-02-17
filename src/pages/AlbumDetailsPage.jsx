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
    <div className="max-w-3xl mx-auto p-4 mb-5 bg-gray-800 rounded-lg shadow-lg">
      <img
        src={album.image}
        alt={album.name}
        className="max-w-full h-auto rounded-lg shadow-lg"
      />
      <h3 className="my-4 text-3xl font-bold text-white">{album.name}</h3>
      <p className="text-lg text-gray">
        {album.artist || 'Artista desconocido'}
      </p>
      <p className="text-lg text-gray">{album.year || 'Año desconocido'}</p>
      <p className="text-lg text-gray">{album.genre || 'Género desconocido'}</p>
      <p className="text-lg text-gray">{album.label || 'Sello desconocido'}</p>
      <p className="text-lg text-gray">{album.country || 'País desconocido'}</p>
      <p className="text-lg text-gray">
        {album.released || 'Fecha de lanzamiento desconocida'}
      </p>
      <p className="text-lg text-gray">{album.notes || 'Sin notas'}</p>
      <p className="text-lg text-gray">
        {Array.isArray(album.formats)
          ? album.formats.join(', ')
          : album.formats || 'Formato desconocido'}
      </p>
      <p className="text-lg text-gray">
        {album.lowest_price ? `$${album.lowest_price}` : 'Precio no disponible'}
      </p>
      <p className="text-lg text-gray">
        {Array.isArray(album.styles)
          ? album.styles.join(', ')
          : album.styles || 'Estilos no disponibles'}
      </p>
      <p className="text-lg text-gray">
        Rating: {album.rating || 'Sin rating'}
      </p>
      <p className="text-lg text-gray">
        Rating Count: {album.rating_count || 0}
      </p>
      <p className="text-lg text-gray">
        Credits: {album.credits || 'Créditos no disponibles'}
      </p>
      <a
        href={album.discogs_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        View on Discogs
      </a>
      <ol className="list-decimal list-inside text-lg text-gray mt-4">
        {Array.isArray(album.tracklist)
          ? album.tracklist.map((track, index) => <li key={index}>{track}</li>)
          : 'Sin lista de pistas'}
      </ol>
      {album.videos?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-2xl font-bold text-white">Videos</h4>
          {album.videos.map((video, index) => (
            <div key={index} className="mt-2">
              <a
                href={video.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {video.title}
              </a>
            </div>
          ))}
        </div>
      )}
      {showCollectedBy && (
        <p className="text-lg text-gray mt-4">
          Añadido por: {album.userNames ? album.userNames.join(', ') : 'N/A'}
        </p>
      )}
      {showCollectedBy && (
        <p className="text-lg text-gray">
          En wishlist de:{' '}
          {album.wishlistUserNames ? album.wishlistUserNames.join(', ') : 'N/A'}
        </p>
      )}

      {album.userIds?.includes(userId) && (
        <button
          onClick={handleDeleteAlbum}
          className="mt-4 px-4 py-2 text-black rounded-full font-medium bg-red-500 hover:bg-red-600 text-lg font-bold"
        >
          Eliminar de mis álbumes
        </button>
      )}
    </div>
  )
}

export default AlbumDetailsPage
