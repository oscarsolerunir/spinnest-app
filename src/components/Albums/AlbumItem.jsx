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
  confirmDeleteAlbum,
  showCollectedBy = true,
  showDetailsLink = true
}) => {
  const [currentUser] = useAuthState(auth)
  const [isInMyAlbums, setIsInMyAlbums] = useState(
    album.userIds?.includes(currentUser?.uid) || false
  )
  const [isInWishlist, setIsInWishlist] = useState(
    album.isInWishlistOfUserIds?.includes(currentUser?.uid) || false
  )

  if (!album || !album.id || !album.name) {
    console.error('⚠️ Error: El álbum es inválido:', album)
    return null
  }

  // Normalización de datos para evitar errores
  const albumArtist = album.artist || 'Artista desconocido'
  const albumYear = album.year || 'Año desconocido'
  const albumGenre = Array.isArray(album.genre)
    ? album.genre.join(', ')
    : album.genre || 'Género desconocido'
  const albumLabel = Array.isArray(album.label)
    ? album.label.join(', ')
    : album.label || 'Sello desconocido'

  const handleDeleteClick = e => {
    e.preventDefault() // ⛔ Evitar recarga de la página
    e.stopPropagation()
    if (confirmDeleteAlbum) {
      confirmDeleteAlbum(album.id)
    }
  }

  const handleWishlistClick = async e => {
    e.preventDefault() // ⛔ Evitar recarga de la página
    e.stopPropagation()
    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(currentUser.uid, album.id)
        setIsInWishlist(false)
        console.log('✅ Álbum eliminado de la wishlist con éxito.')
      } else {
        await addToWishlist(currentUser.uid, album)
        setIsInWishlist(true)
        console.log('✅ Álbum añadido a la wishlist con éxito.')
      }
    } catch (error) {
      console.error('⚠️ Error en wishlist:', error)
    }
  }

  const handleMyAlbumsClick = async e => {
    e.preventDefault() // ⛔ Evitar recarga de la página
    e.stopPropagation()
    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    try {
      if (isInMyAlbums) {
        await removeFromMyAlbums(currentUser.uid, album.id, setIsInMyAlbums)
      } else {
        await addToMyAlbums(currentUser.uid, album, setIsInMyAlbums)
      }
    } catch (error) {
      console.error('⚠️ Error en mis albums:', error)
    }
  }

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

      <Button onClick={handleWishlistClick} color="#4caf50">
        {isInWishlist ? 'Eliminar de mi wishlist' : 'Añadir a wishlist'}
      </Button>
      <Button onClick={handleMyAlbumsClick} color="#2196f3">
        {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
      </Button>
    </AlbumContainer>
  )
}

export default AlbumItem
