import AlbumItem from '../AlbumItem'
import { ListContainer, ListGrid } from './styles'

const AlbumList = ({
  albums,
  confirmDeleteAlbum,
  onClick,
  showCollectedBy = true
}) => {
  return (
    <ListContainer>
      <ListGrid>
        {albums.map(album => (
          <AlbumItem
            key={album.id}
            album={album}
            confirmDeleteAlbum={confirmDeleteAlbum}
            onClick={onClick}
            showCollectedBy={showCollectedBy}
          />
        ))}
      </ListGrid>
    </ListContainer>
  )
}

export default AlbumList
