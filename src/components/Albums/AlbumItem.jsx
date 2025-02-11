import styled from 'styled-components'
import { Link } from 'react-router-dom'

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

const DeleteButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #ff1a1a;
  }
`

const WishlistButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #45a049;
  }
`

const AlbumItem = ({
  album,
  userId,
  isInWishlist = false,
  confirmDeleteAlbum,
  handleAddToWishlist,
  handleRemoveFromWishlist,
  onClick,
  showCollectedBy = true,
  showDetailsLink = true
}) => {
  const isOwnAlbum = album.userIds && album.userIds.includes(userId)

  const handleDeleteClick = e => {
    e.stopPropagation()
    if (confirmDeleteAlbum) {
      confirmDeleteAlbum(album.id)
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick(album.id)
    }
  }

  const handleWishlistClick = async e => {
    e.stopPropagation()
    console.log('handleWishlistClick ejecutado:', album.name) // 🚀 Verificar si el evento se dispara

    try {
      if (isInWishlist) {
        if (typeof handleRemoveFromWishlist === 'function') {
          console.log('Intentando eliminar de wishlist:', album.name)
          await handleRemoveFromWishlist(album)
          console.log('Álbum eliminado de la wishlist con éxito.')
        } else {
          console.error('❌ handleRemoveFromWishlist no está definido.')
        }
      } else {
        if (typeof handleAddToWishlist === 'function') {
          console.log('Intentando añadir a wishlist:', album.name)
          await handleAddToWishlist(album)
          console.log('Álbum añadido a la wishlist con éxito.')
        } else {
          console.error('❌ handleAddToWishlist no está definido.')
        }
      }
    } catch (error) {
      console.error(`⚠️ Error en wishlist:`, error)
    }
  }

  return (
    <AlbumContainer onClick={handleClick}>
      <AlbumImage src={album.image} alt={album.name} />
      <AlbumTitle>{album.name}</AlbumTitle>
      <p>{album.artist}</p>
      <p>{album.year}</p>
      <p>{album.genre}</p>
      <p>{album.label}</p>
      {showCollectedBy && album.userNames && (
        <p>Añadido por: {album.userNames.join(', ')}</p>
      )}
      {showDetailsLink && <Link to={`/album/${album.id}`}>Ver detalles</Link>}
      {confirmDeleteAlbum && (
        <DeleteButton onClick={handleDeleteClick}>Borrar</DeleteButton>
      )}
      {!isOwnAlbum && (
        <WishlistButton onClick={handleWishlistClick}>
          {isInWishlist ? 'Eliminar de mi wishlist' : 'Añadir a wishlist'}
        </WishlistButton>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
