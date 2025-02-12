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

const MyAlbumsButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #1976d2;
  }
`

const AlbumItem = ({
  album,
  userId,
  isInWishlist = false,
  isInMyAlbums = false,
  confirmDeleteAlbum,
  showCollectedBy = true,
  showDetailsLink = true
}) => {
  const [currentUser] = useAuthState(auth)

  const handleDeleteClick = e => {
    e.stopPropagation()
    if (confirmDeleteAlbum) {
      confirmDeleteAlbum(album.id)
    }
  }

  const handleWishlistClick = async e => {
    e.stopPropagation()
    console.log('handleWishlistClick ejecutado:', album.name)

    try {
      if (isInWishlist) {
        await removeFromWishlist(currentUser.uid, album.id)
        console.log('Álbum eliminado de la wishlist con éxito.')
      } else {
        await addToWishlist(currentUser.uid, album)
        console.log('Álbum añadido a la wishlist con éxito.')
      }
    } catch (error) {
      console.error(`⚠️ Error en wishlist:`, error)
    }
  }

  const handleMyAlbumsClick = async e => {
    e.stopPropagation()
    console.log('handleMyAlbumsClick ejecutado:', album.name)

    try {
      if (isInMyAlbums) {
        await removeFromMyAlbums(currentUser.uid, album.id)
        console.log('Álbum eliminado de mis albums con éxito.')
      } else {
        await addToMyAlbums(currentUser.uid, album)
        console.log('Álbum añadido a mis albums con éxito.')
      }
    } catch (error) {
      console.error(`⚠️ Error en mis albums:`, error)
    }
  }

  const isOwnAlbum = currentUser && currentUser.uid === userId

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
        <DeleteButton onClick={handleDeleteClick}>Borrar</DeleteButton>
      )}
      {!isOwnAlbum && (
        <>
          <WishlistButton onClick={handleWishlistClick}>
            {isInWishlist ? 'Eliminar de mi wishlist' : 'Añadir a wishlist'}
          </WishlistButton>
          <MyAlbumsButton onClick={handleMyAlbumsClick}>
            {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
          </MyAlbumsButton>
        </>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
