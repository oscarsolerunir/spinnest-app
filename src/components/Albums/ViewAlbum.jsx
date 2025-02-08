import styled from 'styled-components'

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

const ViewAlbum = ({
  album,
  confirmDeleteAlbum,
  onClick,
  showCollectedBy = true
}) => {
  const handleDeleteClick = e => {
    e.stopPropagation()
    confirmDeleteAlbum(album.id)
  }

  const handleClick = () => {
    if (onClick) {
      onClick(album.id)
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
      {showCollectedBy && <p>Añadido por: {album.userName}</p>}
      {confirmDeleteAlbum && (
        <DeleteButton onClick={handleDeleteClick}>Borrar</DeleteButton>
      )}
    </AlbumContainer>
  )
}

export default ViewAlbum
