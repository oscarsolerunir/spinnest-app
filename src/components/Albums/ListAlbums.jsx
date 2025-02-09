import ViewAlbum from './ViewAlbum'
import styled from 'styled-components'

const ListContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`

const ListGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`

const ListAlbums = ({
  albums = [], // Default to an empty array if albums is undefined
  confirmDeleteAlbum,
  onClick,
  showCollectedBy = true
}) => {
  return (
    <ListContainer>
      <ListGrid>
        {albums.map(album => (
          <ViewAlbum
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

export default ListAlbums
