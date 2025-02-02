import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const CollectionCard = styled.div`
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

const CollectionTitle = styled.h3`
  margin: 10px 0;
`

const ItemCollection = ({ collection }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/collection/${collection.id}`)
  }

  return (
    <CollectionCard onClick={handleClick}>
      <ul>
        {collection.albums.map(album => (
          <li key={album.id}>
            <img src={album.image} alt={album.name} width="50" height="50" />
            {album.name}
          </li>
        ))}
      </ul>
      <CollectionTitle>{collection.name}</CollectionTitle>
      <p>{collection.description}</p>
    </CollectionCard>
  )
}

export default ItemCollection
