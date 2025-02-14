import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { addToMyAlbums, removeFromMyAlbums } from '../../services/api'
import { auth } from '../../services/firebase'
import { useState } from 'react'

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

const Button = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  background-color: ${({ color }) => color};
  color: white;

  &:hover {
    opacity: 0.8;
  }
`

const AlbumItem = ({
  album,
  userId,
  handleRemoveFromMyAlbums, // 🔹 Recibimos la función desde ExplorePage
  showCollectedBy = true,
  showDetailsLink = true
}) => {
  const [currentUser] = useAuthState(auth)
  const [isInMyAlbums, setIsInMyAlbums] = useState(
    album.userIds?.includes(currentUser?.uid) || false
  )

  if (!album || !album.id || !album.name) {
    console.error('⚠️ Error: El álbum es inválido:', album)
    return null
  }

  // Normalización de datos
  const albumArtist = album.artist || 'Artista desconocido'
  const albumYear = album.year || 'Año desconocido'
  const albumGenre = Array.isArray(album.genre)
    ? album.genre.join(', ')
    : album.genre || 'Género desconocido'
  const albumLabel = Array.isArray(album.label)
    ? album.label.join(', ')
    : album.label || 'Sello desconocido'

  const handleMyAlbumsClick = async e => {
    e.stopPropagation()
    e.preventDefault()

    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    if (isInMyAlbums) {
      const confirmDelete = window.confirm(
        '¿Seguro que quieres eliminar este álbum de tu colección?'
      )
      if (!confirmDelete) return

      console.log(
        `🗑️ Eliminando álbum ID: ${album.id} para usuario: ${currentUser.uid}`
      )

      try {
        await removeFromMyAlbums(currentUser.uid, album.id)
        setIsInMyAlbums(false)
        handleRemoveFromMyAlbums(album.id) // 🔹 Elimina de ExplorePage
        console.log('✅ Álbum eliminado de mis albums con éxito.')
      } catch (error) {
        console.error('⚠️ Error eliminando álbum:', error)
      }
    } else {
      console.log(
        `📀 Añadiendo álbum ID: ${album.id} para usuario: ${currentUser.uid}`
      )

      try {
        await addToMyAlbums(currentUser.uid, album)
        setIsInMyAlbums(true)
        console.log('✅ Álbum añadido a mis albums con éxito.')
      } catch (error) {
        console.error('⚠️ Error añadiendo álbum:', error)
      }
    }
  }

  return (
    <AlbumContainer>
      <AlbumImage src={album.image} alt={album.name} />
      <AlbumTitle>{album.name}</AlbumTitle>
      <p>{albumArtist}</p>
      <p>{albumYear}</p>
      <p>{albumGenre}</p>
      <p>{albumLabel}</p>

      {showDetailsLink && <Link to={`/album/${album.id}`}>Ver detalles</Link>}

      <Button onClick={handleMyAlbumsClick} color="#2196f3">
        {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
      </Button>
    </AlbumContainer>
  )
}

export default AlbumItem
