import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import AlbumItem from './AlbumItem'
import { useAlbums } from '../../contexts/AlbumsContext'

const AlbumsList = ({
  albums,
  handleAddToMyAlbums,
  handleRemoveFromMyAlbums,
  handleAddToWishlist,
  handleRemoveFromWishlist,
  showCollectedBy = true,
  showDetailsLink = true,
  showWishlistButton = true,
  showMyAlbumsButton = true,
  wishlistOnly = false
}) => {
  const { removeAlbum } = useAlbums()
  const [currentUser] = useAuthState(auth)

  const onRemoveFromMyAlbums = async albumId => {
    if (handleRemoveFromMyAlbums) {
      await handleRemoveFromMyAlbums(albumId)
    }
    removeAlbum(albumId)
  }

  if (!albums || albums.length === 0) {
    return <p className="mt-4">No hay álbumes disponibles.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 py-4">
      {albums.map(album => {
        if (!album || !album.id || !album.name) {
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
            showMyAlbumsButton={showMyAlbumsButton}
            wishlistOnly={wishlistOnly}
          />
        )
      })}
    </div>
  )
}

export default AlbumsList
