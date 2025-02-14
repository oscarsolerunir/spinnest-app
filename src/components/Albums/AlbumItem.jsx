import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  addToWishlist,
  removeFromWishlist,
  addToMyAlbums,
  removeFromMyAlbums
} from '../../services/api'
import { auth } from '../../services/firebase'

const AlbumContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`

const AlbumImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 4px;
`

const AlbumTitle = styled.h3`
  margin: 10px 0;
`

const Button = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  background-color: ${({ color }) => color};
  color: white;

  &:hover {
    opacity: 0.8;
  }
`

const AlbumItem = ({
  album,
  userId,
  isInMyAlbums = false,
  confirmDeleteAlbum,
  showCollectedBy = true,
  showDetailsLink = true,
  handleRemoveFromWishlist,
  handleAddToWishlist,
  handleRemoveFromMyAlbums,
  handleAddToMyAlbums
}) => {
  const [currentUser] = useAuthState(auth)

  // 🚨 Verificar que el álbum tiene los datos necesarios
  if (!album || !album.id || !album.name) {
    console.error('⚠️ Error: El álbum es inválido:', album)
    return null
  }

  // 🛠️ Normalizar datos para evitar errores
  const albumArtist = album.artist || 'Artista desconocido'
  const albumYear = album.year || 'Año desconocido'
  const albumGenre = Array.isArray(album.genre)
    ? album.genre.join(', ')
    : album.genre || 'Género desconocido'
  const albumLabel = Array.isArray(album.label)
    ? album.label.join(', ')
    : album.label || 'Sello desconocido'

  const handleDeleteClick = e => {
    e.stopPropagation()
    if (confirmDeleteAlbum) {
      confirmDeleteAlbum(album.id)
    }
  }

  const handleWishlistClick = async e => {
    e.stopPropagation()
    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(currentUser.uid, album.id)
        handleRemoveFromWishlist(album)
        console.log('✅ Álbum eliminado de la wishlist con éxito.')
      } else {
        await addToWishlist(currentUser.uid, album)
        handleAddToWishlist(album)
        console.log('✅ Álbum añadido a la wishlist con éxito.')
      }
    } catch (error) {
      console.error('⚠️ Error en wishlist:', error)
    }
  }

  const handleMyAlbumsClick = async e => {
    e.stopPropagation()
    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    console.log('🛠️ Click en "Añadir a mis albums" para:', album)

    const confirmAdd = window.confirm(
      '¿Seguro que quieres añadir este álbum a tus albums?'
    )
    if (!confirmAdd) return

    try {
      console.log('🚀 Enviando álbum a la función addToMyAlbums:', album)
      if (isInMyAlbums) {
        await removeFromMyAlbums(currentUser.uid, album.id)
        handleRemoveFromMyAlbums(album)
        console.log('✅ Álbum eliminado de mis albums con éxito.')
      } else {
        await addToMyAlbums(currentUser.uid, album)
        handleAddToMyAlbums(album)
        console.log('✅ Álbum añadido a mis albums con éxito.')
      }
    } catch (error) {
      console.error('⚠️ Error en mis albums:', error)
    }
  }

  const isOwnAlbum =
    Array.isArray(album.userIds) && album.userIds.includes(userId)

  const isInWishlist =
    Array.isArray(album.isInWishlistOfUserIds) &&
    album.isInWishlistOfUserIds.includes(currentUser?.uid)

  return (
    <AlbumContainer>
      <AlbumImage src={album.image} alt={album.name} />
      <AlbumTitle>{album.name}</AlbumTitle>
      <p>{albumArtist}</p>
      <p>{albumYear}</p>
      <p>{albumGenre}</p>
      <p>{albumLabel}</p>

      {showCollectedBy && album.userNames && (
        <p>Añadido por: {album.userNames.join(', ')}</p>
      )}

      {showCollectedBy && album.isInWishlistOfUserNames && (
        <p>En wishlist de: {album.isInWishlistOfUserNames.join(', ')}</p>
      )}

      {showDetailsLink && <Link to={`/album/${album.id}`}>Ver detalles</Link>}

      {confirmDeleteAlbum && (
        <Button onClick={handleDeleteClick} color="#ff4d4d">
          Borrar
        </Button>
      )}

      {!isOwnAlbum && (
        <>
          <Button onClick={handleWishlistClick} color="#4caf50">
            {isInWishlist ? 'Eliminar de mi wishlist' : 'Añadir a wishlist'}
          </Button>
          <Button onClick={handleMyAlbumsClick} color="#2196f3">
            {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
          </Button>
        </>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
