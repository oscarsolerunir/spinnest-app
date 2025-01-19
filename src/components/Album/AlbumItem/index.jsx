import { AlbumContainer, AlbumImage, AlbumTitle, DeleteButton } from './styles'

const AlbumItem = ({
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
      {showCollectedBy && <p>Collected by: {album.userName}</p>}
      {confirmDeleteAlbum && (
        <DeleteButton onClick={handleDeleteClick}>Delete</DeleteButton>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
