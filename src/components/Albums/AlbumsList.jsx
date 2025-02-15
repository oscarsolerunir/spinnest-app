import AlbumItem from './AlbumItem'
import { useAlbums } from '../../context/AlbumsContext'

const AlbumsList = ({
  albums,
  userId,
  handleAddToMyAlbums,
  handleRemoveFromMyAlbums,
  handleAddToWishlist,
  handleRemoveFromWishlist,
  showCollectedBy = true,
  showDetailsLink = true
}) => {
  const { removeAlbum } = useAlbums()

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
    <div>
      {albums.map(album => (
        <AlbumItem
          key={album.id}
          album={album}
          userId={userId}
          handleAddToMyAlbums={handleAddToMyAlbums}
          handleRemoveFromMyAlbums={onRemoveFromMyAlbums}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          showCollectedBy={showCollectedBy}
          showDetailsLink={showDetailsLink}
        />
      ))}
    </div>
  )
}

export default AlbumsList
