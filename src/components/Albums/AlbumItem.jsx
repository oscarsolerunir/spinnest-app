import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { addToMyAlbums, removeFromMyAlbums } from '../../services/api'
import { auth } from '../../services/firebase'
import { useState, useEffect } from 'react'
import { useWishlist } from '../../context/WishlistContext'

const AlbumItem = ({
  album,
  handleRemoveFromMyAlbums,
  handleAddToWishlist,
  handleRemoveFromWishlist,
  showDetailsLink = true,
  showWishlistButton = true,
  showMyAlbumsButton = true,
  wishlistOnly = false
}) => {
  const [currentUser] = useAuthState(auth)
  const { wishlist, addToWishlistContext, removeFromWishlistContext } =
    useWishlist()

  const [isInMyAlbums, setIsInMyAlbums] = useState(
    album.userIds?.includes(currentUser?.uid) || false
  )
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    setIsInMyAlbums(album.userIds?.includes(currentUser?.uid) || false)
    setIsInWishlist(wishlist.some(item => item.albumId === album.id))
  }, [album, currentUser, wishlist])

  if (!album || !album.id || !album.name) {
    console.error('⚠️ Error: El álbum es inválido:', album)
    return null
  }

  const albumArtist = album.artist || 'Artista desconocido'
  const albumYear = album.year || 'Año desconocido'
  const albumGenre = Array.isArray(album.genre)
    ? album.genre.join(', ')
    : album.genre || 'Género desconocido'
  const albumLabel = Array.isArray(album.label)
    ? album.label.join(', ')
    : album.label || 'Sello desconocido'

  const handleMyAlbumsClick = async e => {
    e.stopPropagation()
    e.preventDefault()

    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    if (isInMyAlbums) {
      const confirmDelete = window.confirm(
        '¿Seguro que quieres eliminar este álbum de tu colección?'
      )
      if (!confirmDelete) return

      try {
        await removeFromMyAlbums(currentUser.uid, album.id)
        setIsInMyAlbums(false)
        if (handleRemoveFromMyAlbums) {
          handleRemoveFromMyAlbums(album.id)
        }
      } catch (error) {
        console.error('⚠️ Error eliminando álbum:', error)
      }
    } else {
      try {
        await addToMyAlbums(currentUser.uid, album)
        setIsInMyAlbums(true)
      } catch (error) {
        console.error('⚠️ Error añadiendo álbum:', error)
      }
    }
  }

  const handleWishlistClick = async e => {
    e.stopPropagation()
    e.preventDefault()

    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    if (isInWishlist) {
      try {
        if (handleRemoveFromWishlist) {
          await handleRemoveFromWishlist(album.id)
          setIsInWishlist(false)
          removeFromWishlistContext(album.id)
        }
      } catch (error) {
        console.error('⚠️ Error eliminando álbum de la wishlist:', error)
      }
    } else {
      try {
        if (handleAddToWishlist) {
          await handleAddToWishlist(album)
          setIsInWishlist(true)
          addToWishlistContext({
            albumId: album.id,
            albumName: album.name,
            albumArtist: album.artist,
            albumYear: album.year,
            albumGenre: album.genre,
            albumLabel: album.label,
            albumImage: album.image,
            addedAt: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('⚠️ Error añadiendo álbum a la wishlist:', error)
      }
    }
  }

  const shouldShowWishlistButton =
    showWishlistButton &&
    (wishlistOnly
      ? handleRemoveFromWishlist
      : handleAddToWishlist && handleRemoveFromWishlist) &&
    !(album.userIds && album.userIds.includes(currentUser?.uid))

  return (
    <div className="border border-gray-300 rounded-lg p-4 text-center cursor-pointer mb-5 transition-transform transform hover:scale-105">
      <img
        src={album.image}
        alt={album.name}
        className="max-w-full h-auto rounded-md"
      />
      <h3 className="mt-2 mb-2 text-lg font-semibold">{album.name}</h3>
      <p>{albumArtist}</p>
      <p>{albumYear}</p>
      <p>{albumGenre}</p>
      <p>{albumLabel}</p>

      {showDetailsLink && (
        <Link
          to={`/album/${album.id}`}
          className="text-blue-500 hover:underline"
        >
          Ver detalles
        </Link>
      )}

      {showMyAlbumsButton && (
        <button
          onClick={handleMyAlbumsClick}
          className="mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
        </button>
      )}

      {shouldShowWishlistButton && (
        <button
          onClick={handleWishlistClick}
          className="mt-2 px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600"
        >
          {isInWishlist ? 'Eliminar de wishlist' : 'Añadir a wishlist'}
        </button>
      )}
    </div>
  )
}

export default AlbumItem
