import AlbumItem from '../AlbumItem'
import { ListContainer, ListGrid } from './styles'

const AlbumList = ({
  albums,
  onClick,
  onDelete,
  selectedAlbums = [],
  context,
  userName
}) => {
  return (
    <ListContainer>
      <ListGrid>
        {albums.map(album => (
          <AlbumItem
            key={album.id}
            album={album}
            onClick={onClick}
            onDelete={onDelete}
            selectedAlbums={selectedAlbums}
            context={context}
            userName={userName}
          />
        ))}
      </ListGrid>
    </ListContainer>
  )
}

export default AlbumList
