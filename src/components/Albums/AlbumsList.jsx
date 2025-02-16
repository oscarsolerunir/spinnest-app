import styled from 'styled-components'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import AlbumItem from './AlbumItem'
import { useAlbums } from '../../context/AlbumsContext'

const AlbumsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 320px));
  gap: 20px;
  padding: 20px;
  justify-items: center;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`

const AlbumsList = ({
  albums,
  handleAddToMyAlbums,
  handleRemoveFromMyAlbums,
  handleAddToWishlist,
  handleRemoveFromWishlist,
  showCollectedBy = true,
  showDetailsLink = true,
  showWishlistButton = true,
  wishlistOnly = false // Nueva prop
}) => {
  const { removeAlbum } = useAlbums()
  const [currentUser] = useAuthState(auth)

  const onRemoveFromMyAlbums = async albumId => {
    if (handleRemoveFromMyAlbums) {
      await handleRemoveFromMyAlbums(albumId)
    }
    removeAlbum(albumId) // Actualizar el contexto globalmente
  }

  if (!albums || albums.length === 0) {
    return <p>No hay álbumes disponibles.</p>
  }

  return (
    <AlbumsGrid>
      {albums.map(album => {
        if (!album || !album.id || !album.name) {
          console.error('⚠️ Error: El álbum es inválido:', album)
          return null
        }
        return (
          <AlbumItem
            key={album.id}
            album={album}
            userId={currentUser?.uid}
            handleAddToMyAlbums={handleAddToMyAlbums}
            handleRemoveFromMyAlbums={onRemoveFromMyAlbums}
            handleAddToWishlist={handleAddToWishlist}
            handleRemoveFromWishlist={handleRemoveFromWishlist}
            showCollectedBy={showCollectedBy}
            showDetailsLink={showDetailsLink}
            showWishlistButton={showWishlistButton}
            wishlistOnly={wishlistOnly} // Reenvío de la prop
          />
        )
      })}
    </AlbumsGrid>
  )
}

export default AlbumsList
