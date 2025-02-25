import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../services/firebase'
import { useAlbums } from '../contexts/AlbumsContext'
import { useWishlist } from '../contexts/WishlistContext'
import {
  getAlbumById,
  addToMyAlbums,
  removeFromMyAlbums,
  addToWishlist,
  removeFromWishlist
} from '../services/api'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { doc, getDoc } from 'firebase/firestore'

const AlbumDetailsPage = ({ showCollectedBy = true }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isInMyAlbums, setIsInMyAlbums] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistUserNames, setWishlistUserNames] = useState([]) // Estado para los nombres de los usuarios en la wishlist
  const [currentUser] = useAuthState(auth)
  const { addAlbum, removeAlbum } = useAlbums()
  const { wishlist, addToWishlistContext, removeFromWishlistContext } =
    useWishlist()

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const albumData = await getAlbumById(id)
        if (!albumData) {
          throw new Error('Álbum no encontrado en Firestore')
        }
        setAlbum(albumData)
        setIsInMyAlbums(albumData.userIds?.includes(currentUser?.uid) || false)
        setIsInWishlist(wishlist.some(item => item.albumId === albumData.id))

        // Obtener los nombres de los usuarios que tienen el álbum en su wishlist
        const userNames = await Promise.all(
          wishlist
            .filter(item => item.albumId === albumData.id)
            .map(async item => {
              const userDoc = await getDoc(doc(db, 'users', item.userId))
              return userDoc.exists()
                ? { name: userDoc.data().name, id: item.userId }
                : { name: 'Desconocido', id: null }
            })
        )
        setWishlistUserNames(userNames)
      } catch {
        setError('Error fetching album. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAlbum()
  }, [id, currentUser, wishlist])

  const handleMyAlbumsClick = async e => {
    e.stopPropagation()
    e.preventDefault()

    if (!currentUser?.uid) return

    if (isInMyAlbums) {
      const confirmDelete = window.confirm(
        '¿Seguro que quieres eliminar este álbum de tu colección?'
      )
      if (!confirmDelete) return

      try {
        await removeFromMyAlbums(currentUser.uid, album.id)
        setIsInMyAlbums(false)
        removeAlbum(album.id)
      } catch (error) {
        console.error('Error eliminando álbum:', error)
      }
    } else {
      try {
        await addToMyAlbums(currentUser.uid, album)
        setIsInMyAlbums(true)
        addAlbum(album)
      } catch (error) {
        console.error('Error añadiendo álbum:', error)
      }
    }
  }

  const handleWishlistClick = async e => {
    e.stopPropagation()
    e.preventDefault()

    if (!currentUser?.uid) return

    if (isInWishlist) {
      try {
        await removeFromWishlist(currentUser.uid, album.id)
        setIsInWishlist(false)
        removeFromWishlistContext(album.id)
      } catch (error) {
        console.error('Error eliminando álbum de la wishlist:', error)
      }
    } else {
      try {
        await addToWishlist(currentUser.uid, album)
        setIsInWishlist(true)
        addToWishlistContext({
          albumId: album.id,
          albumName: album.name,
          albumArtist: album.artist,
          albumYear: album.year,
          albumGenre: album.genre,
          albumLabel: album.label,
          albumImage: album.image,
          addedAt: new Date().toISOString(),
          userId: currentUser.uid // Asegúrate de incluir el userId
        })
      } catch (error) {
        console.error('Error añadiendo álbum a la wishlist:', error)
      }
    }
  }

  const handleBackClick = () => {
    navigate(-1)
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!album) return <p>Álbum no encontrado.</p>

  return (
    <div className="max-w-7xl p-4 mb-5 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:sticky top-4 self-start">
        <img
          src={album.image}
          alt={album.name}
          className="max-w-full h-auto rounded-lg shadow-lg"
        />
      </div>
      <div className="overflow-y-auto">
        <h3 className="my-4 text-3xl font-medium text-light">{album.name}</h3>
        <p className="text-lg text-light">
          {album.artist || 'Artista desconocido'}
        </p>
        <p className="text-lg text-light">{album.year || 'Año desconocido'}</p>
        <p className="text-lg text-light">
          {album.genre || 'Género desconocido'}
        </p>
        <p className="text-lg text-light">
          {album.label || 'Sello desconocido'}
        </p>
        <p className="text-lg text-light">
          {album.country || 'País desconocido'}
        </p>
        <p className="text-lg text-light">
          {album.released || 'Fecha de lanzamiento desconocida'}
        </p>
        <p className="text-lg text-light">{album.notes || 'Sin notas'}</p>
        <p className="text-lg text-light">
          {Array.isArray(album.formats)
            ? album.formats.join(', ')
            : album.formats || 'Formato desconocido'}
        </p>
        <p className="text-lg text-light">
          {album.lowest_price
            ? `$${album.lowest_price}`
            : 'Precio no disponible'}
        </p>
        <p className="text-lg text-light">
          {Array.isArray(album.styles)
            ? album.styles.join(', ')
            : album.styles || 'Estilos no disponibles'}
        </p>
        <p className="text-lg text-light">
          Rating: {album.rating || 'Sin rating'}
        </p>
        <p className="text-lg text-light">
          Rating Count: {album.rating_count || 0}
        </p>
        <p className="text-lg text-light">
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
        <ol className="list-decimal list-inside text-lg text-light mt-4">
          {Array.isArray(album.tracklist)
            ? album.tracklist.map((track, index) => (
                <li key={index}>{track}</li>
              ))
            : 'Sin lista de pistas'}
        </ol>
        {album.videos?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-2xl font-medium text-light">Videos</h4>
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
          <p className="text-lg text-light mt-4">
            Añadido por:{' '}
            {album.userNames
              ? album.userNames.map((name, index) => (
                  <Link
                    key={index}
                    to={`/user/${album.userIds[index]}`}
                    className="text-primary hover:underline"
                  >
                    {name}
                  </Link>
                ))
              : 'N/A'}
          </p>
        )}
        {showCollectedBy && (
          <p className="text-lg text-light">
            En wishlist de:{' '}
            {wishlistUserNames.length > 0
              ? wishlistUserNames.map((user, index) => (
                  <Link
                    key={index}
                    to={`/user/${user.id}`}
                    className="text-primary hover:underline"
                  >
                    {user.name}
                  </Link>
                ))
              : 'N/A'}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMyAlbumsClick}
            className={`mt-4 px-4 py-2 text-black rounded-full font-medium ${
              isInMyAlbums
                ? 'bg-neutral hover:bg-neutralaccent'
                : 'bg-primary hover:bg-accent'
            } text-lg font-medium`}
          >
            {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
          </button>
          {!isInMyAlbums && (
            <button
              onClick={handleWishlistClick}
              className="mt-4 text-light rounded flex items-center justify-center"
            >
              <span className="mr-2">
                {isInWishlist ? <FaHeart /> : <FaRegHeart />}
              </span>
              {isInWishlist ? 'Eliminar de wishlist' : 'Añadir a wishlist'}
            </button>
          )}
        </div>
        <button
          onClick={handleBackClick}
          className="mt-6 text-neutralaccent hover:text-light rounded-full font-medium text-lg font-medium"
        >
          Volver
        </button>
      </div>
    </div>
  )
}

export default AlbumDetailsPage
