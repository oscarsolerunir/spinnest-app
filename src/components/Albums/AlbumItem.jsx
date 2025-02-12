import styled from 'styled-components'
import { Link } from 'react-router-dom'
import {
  addToWishlist,
  removeFromWishlist,
  addToMyAlbums,
  removeFromMyAlbums
} from '../../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import { useState } from 'react'

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
  showDetailsLink = true
}) => {
  const [currentUser] = useAuthState(auth)
  const [wishlistState, setWishlistState] = useState(
    Array.isArray(album?.wishlistUserIds) &&
      album.wishlistUserIds.includes(currentUser?.uid)
  )
  const [myAlbumsState, setMyAlbumsState] = useState(isInMyAlbums)

  if (!album) return null // 🔹 Evita errores si `album` es undefined

  const isOwnAlbum =
    Array.isArray(album.userIds) && album.userIds.includes(userId)

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
      if (wishlistState) {
        await removeFromWishlist(currentUser.uid, album.id)
        console.log('✅ Álbum eliminado de la wishlist con éxito.')
      } else {
        await addToWishlist(currentUser.uid, album)
        console.log('✅ Álbum añadido a la wishlist con éxito.')
      }
      setWishlistState(!wishlistState) // 🔹 Actualiza el estado
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

    try {
      if (myAlbumsState) {
        await removeFromMyAlbums(currentUser.uid, album.id)
        console.log('✅ Álbum eliminado de mis albums con éxito.')
      } else {
        await addToMyAlbums(currentUser.uid, album)
        console.log('✅ Álbum añadido a mis albums con éxito.')
      }
      setMyAlbumsState(!myAlbumsState) // 🔹 Actualiza el estado
    } catch (error) {
      console.error('⚠️ Error en mis albums:', error)
    }
  }

  return (
    <AlbumContainer>
      <AlbumImage src={album.image} alt={album.name} />
      <AlbumTitle>{album.name}</AlbumTitle>
      <p>{album.artist}</p>
      <p>{album.year}</p>
      <p>{album.genre}</p>
      <p>{album.label}</p>
      {showCollectedBy && album.userNames && (
        <p>Añadido por: {album.userNames.join(', ')}</p>
      )}
      {showCollectedBy && album.wishlistUserNames && (
        <p>En wishlist de: {album.wishlistUserNames.join(', ')}</p>
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
            {wishlistState ? 'Eliminar de mi wishlist' : 'Añadir a wishlist'}
          </Button>
          <Button onClick={handleMyAlbumsClick} color="#2196f3">
            {myAlbumsState ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
          </Button>
        </>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
