import {
  AlbumContainer,
  AlbumImage,
  AlbumTitle,
  DeleteButton,
  AddButton,
  AlbumLink
} from './styles'
import { useNavigate } from 'react-router-dom'
import { createAlbum } from '../../../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../../services/firebase'

const AlbumItem = ({
  album,
  onClick,
  onDelete,
  selectedAlbums = [],
  context
}) => {
  const isSelected = selectedAlbums.includes(album.id)
  const navigate = useNavigate()
  const [user] = useAuthState(auth)

  const handleAddRemoveClick = () => {
    if (onClick) {
      onClick(album.id)
    }
  }

  const handleDeleteClick = e => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(album.id)
    }
  }

  const handleAddToMyAlbums = async e => {
    e.stopPropagation()
    if (user) {
      try {
        await createAlbum({
          name: album.name,
          artist: album.artist,
          year: album.year,
          genre: album.genre,
          label: album.label,
          image: album.image,
          createdAt: new Date().toISOString(),
          userId: user.uid,
          userName: user.displayName || 'Unknown User'
        })
        alert('Album added to My Albums')
        navigate('/my-albums')
      } catch (error) {
        console.error('Error adding album to My Albums:', error)
        alert('Error adding album to My Albums')
      }
    } else {
      alert('You must be logged in to add an album to My Albums')
    }
  }

  return (
    <AlbumContainer>
      <AlbumLink to={`/album/${album.id}`} state={{ from: context }}>
        <AlbumImage src={album.image} alt={album.name} />
        <AlbumTitle>{album.name}</AlbumTitle>
        <p>{album.artist}</p>
        <p>{album.year}</p>
        <p>{album.genre}</p>
        <p>{album.label}</p>
        {context === '/' && <p>Added by: {album.userName}</p>}
      </AlbumLink>
      {context === 'create-collection' &&
        (isSelected ? (
          <DeleteButton onClick={handleAddRemoveClick}>
            Remove from Collection
          </DeleteButton>
        ) : (
          <AddButton onClick={handleAddRemoveClick}>
            Add to Collection
          </AddButton>
        ))}
      {context === 'my-albums' && (
        <DeleteButton onClick={handleDeleteClick}>Delete Album</DeleteButton>
      )}
      {context === 'collection' && (
        <DeleteButton onClick={handleAddRemoveClick}>
          Remove from Collection
        </DeleteButton>
      )}
      {context === 'upload-album' && (
        <AddButton onClick={handleAddToMyAlbums}>Add to My Albums</AddButton>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
