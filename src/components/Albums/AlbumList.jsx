import AlbumItem from './AlbumItem'
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

const AlbumList = ({
  albums = [], // Default to an empty array if albums is undefined
  confirmDeleteAlbum,
  onClick,
  showCollectedBy = true,
  showDetailsLink = true // Default to true
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
            showDetailsLink={showDetailsLink} // Pass the prop to AlbumItem
          />
        ))}
      </ListGrid>
    </ListContainer>
  )
}

export default AlbumList
