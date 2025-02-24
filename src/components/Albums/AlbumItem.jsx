import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { addToMyAlbums, removeFromMyAlbums } from '../../services/api'
import { auth } from '../../services/firebase'
import { useState, useEffect } from 'react'
import { useWishlist } from '../../context/WishlistContext'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

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

    if (!currentUser?.uid) return

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
        console.error('Error eliminando álbum:', error)
      }
    } else {
      try {
        await addToMyAlbums(currentUser.uid, album)
        setIsInMyAlbums(true)
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
        if (handleRemoveFromWishlist) {
          await handleRemoveFromWishlist(album.id)
          setIsInWishlist(false)
          removeFromWishlistContext(album.id)
        }
      } catch (error) {
        console.error('Error eliminando álbum de la wishlist:', error)
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
        console.error('Error añadiendo álbum a la wishlist:', error)
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
    <div className="block rounded-2xl p-4 cursor-pointer mb-5 text-light hover:bg-darkaccent">
      <Link to={`/album/${album.id}`}>
        <img
          src={album.image}
          alt={album.name}
          className="max-w-full h-auto rounded-2xl shadow-xl"
        />
        <h3 className="mt-2 mb-2 text-lg font-semibold truncate">
          {album.name}
        </h3>
        <p className="text-light truncate">Artista: {albumArtist}</p>
        <p className="text-light truncate">Año: {albumYear}</p>
        <p className="text-light truncate">Género: {albumGenre}</p>
        <p className="text-light truncate">Discográfica: {albumLabel}</p>
      </Link>

      {showDetailsLink && (
        <Link
          to={`/album/${album.id}`}
          className="hover:underline my-2 block text-primary"
        >
          Ver detalles
        </Link>
      )}

      {showMyAlbumsButton && (
        <button
          onClick={handleMyAlbumsClick}
          className={`mt-2 px-4 py-2 text-black rounded-full font-medium ${
            isInMyAlbums
              ? 'bg-neutral hover:bg-neutralaccent text-dark text-medium'
              : 'bg-primary hover:bg-accent text-medium'
          }`}
        >
          {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
        </button>
      )}

      {shouldShowWishlistButton && (
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
  )
}

export default AlbumItem
