import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { addToMyAlbums, removeFromMyAlbums } from '../../services/api'
import { auth } from '../../services/firebase'
import { useState, useEffect } from 'react'

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
  handleRemoveFromMyAlbums, // Función para eliminar de "mis albums"
  handleAddToWishlist, // Función para añadir a wishlist
  handleRemoveFromWishlist, // Función para eliminar de wishlist
  showCollectedBy = true,
  showDetailsLink = true,
  showWishlistButton = true // Controla si se muestra el botón de wishlist
}) => {
  const [currentUser] = useAuthState(auth)

  // Estado para "mis albums" basado en album.userIds
  const [isInMyAlbums, setIsInMyAlbums] = useState(
    album.userIds?.includes(currentUser?.uid) || false
  )
  // Estado para wishlist basado en album.isInWishlistOfUserIds
  const [isInWishlist, setIsInWishlist] = useState(
    album.isInWishlistOfUserIds?.includes(currentUser?.uid) || false
  )

  // Si el album o sus datos esenciales no existen, no se renderiza
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

  // Función para gestionar la acción en "Mis Albums"
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
        if (handleRemoveFromMyAlbums) {
          handleRemoveFromMyAlbums(album.id)
        }
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

  // Función para gestionar la acción de wishlist
  const handleWishlistClick = async e => {
    e.stopPropagation()
    e.preventDefault()

    if (!currentUser?.uid) {
      console.error('❌ Error: usuario no autenticado.')
      return
    }

    if (isInWishlist) {
      try {
        if (handleRemoveFromWishlist) {
          await handleRemoveFromWishlist(album.id)
          setIsInWishlist(false)
          console.log('✅ Álbum eliminado de la wishlist con éxito.')
        }
      } catch (error) {
        console.error('⚠️ Error eliminando álbum de la wishlist:', error)
      }
    } else {
      try {
        if (handleAddToWishlist) {
          await handleAddToWishlist(album)
          setIsInWishlist(true)
          console.log('✅ Álbum añadido a la wishlist con éxito.')
        }
      } catch (error) {
        console.error('⚠️ Error añadiendo álbum a la wishlist:', error)
      }
    }
  }

  // Mostrar el botón de wishlist solo si:
  // 1. Se habilita con la prop showWishlistButton.
  // 2. Se han pasado las funciones correspondientes.
  // 3. El álbum NO es propio (es decir, currentUser no es propietario).
  const shouldShowWishlistButton =
    showWishlistButton &&
    handleAddToWishlist &&
    handleRemoveFromWishlist &&
    !(album.userIds && album.userIds.includes(currentUser?.uid))

  return (
    <AlbumContainer>
      <AlbumImage src={album.image} alt={album.name} />
      <AlbumTitle>{album.name}</AlbumTitle>
      <p>{albumArtist}</p>
      <p>{albumYear}</p>
      <p>{albumGenre}</p>
      <p>{albumLabel}</p>

      {showDetailsLink && (
        <>
          {console.log('🔗 ID del álbum en el Link:', album.id)}
          <Link to={`/album/${album.id}`}>Ver detalles</Link>
        </>
      )}

      <Button onClick={handleMyAlbumsClick} color="#2196f3">
        {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
      </Button>

      {shouldShowWishlistButton && (
        <Button onClick={handleWishlistClick} color="#ff9800">
          {isInWishlist ? 'Eliminar de wishlist' : 'Añadir a wishlist'}
        </Button>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
