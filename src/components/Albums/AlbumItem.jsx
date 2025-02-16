import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { addToMyAlbums, removeFromMyAlbums } from '../../services/api'
import { auth } from '../../services/firebase'
import { useState, useEffect } from 'react'
import { useWishlist } from '../../context/WishlistContext'

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
  showWishlistButton = true, // Controla si se muestra el botón de wishlist
  showMyAlbumsButton = true, // Nueva prop para mostrar/ocultar el botón de "Mis Albums"
  wishlistOnly = false // Si true, asumimos que estamos en WishlistPage (solo opción de eliminar)
}) => {
  const [currentUser] = useAuthState(auth)
  const { wishlist, addToWishlistContext, removeFromWishlistContext } =
    useWishlist()

  // Estados iniciales
  const [isInMyAlbums, setIsInMyAlbums] = useState(
    album.userIds?.includes(currentUser?.uid) || false
  )
  const [isInWishlist, setIsInWishlist] = useState(false)

  // Efecto para actualizar los estados cuando cambie el álbum, el usuario o la wishlist
  useEffect(() => {
    setIsInMyAlbums(album.userIds?.includes(currentUser?.uid) || false)
    // Verificamos si el álbum ya está en la wishlist usando el contexto
    setIsInWishlist(wishlist.some(item => item.albumId === album.id))
  }, [album, currentUser, wishlist])

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

  // Función para gestionar "Mis Albums"
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
        // Actualización optimista: añadimos el userId al array local
        setIsInMyAlbums(true)
        console.log('✅ Álbum añadido a mis albums con éxito.')
      } catch (error) {
        console.error('⚠️ Error añadiendo álbum:', error)
      }
    }
  }

  // Función para gestionar la wishlist
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
          removeFromWishlistContext(album.id)
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
          // Agregamos al contexto de wishlist de forma optimista
          addToWishlistContext({
            albumId: album.id,
            albumName: album.name,
            albumArtist: album.artist,
            albumYear: album.year,
            albumGenre: album.genre,
            albumLabel: album.label,
            albumImage: album.image,
            addedAt: new Date().toISOString()
          })
          console.log('✅ Álbum añadido a la wishlist con éxito.')
        }
      } catch (error) {
        console.error('⚠️ Error añadiendo álbum a la wishlist:', error)
      }
    }
  }

  // Condición para mostrar el botón de wishlist:
  // En WishlistPage (wishlistOnly true) solo se muestra la opción de eliminar.
  // En otras páginas, se muestra si ambas funciones están definidas y el álbum no es propio.
  const shouldShowWishlistButton =
    showWishlistButton &&
    (wishlistOnly
      ? handleRemoveFromWishlist
      : handleAddToWishlist && handleRemoveFromWishlist) &&
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

      {/* Mostrar el botón de "Mis Albums" solo si showMyAlbumsButton es true */}
      {showMyAlbumsButton && (
        <Button onClick={handleMyAlbumsClick} color="#2196f3">
          {isInMyAlbums ? 'Eliminar de mis albums' : 'Añadir a mis albums'}
        </Button>
      )}

      {shouldShowWishlistButton && (
        <Button onClick={handleWishlistClick} color="#ff9800">
          {isInWishlist ? 'Eliminar de wishlist' : 'Añadir a wishlist'}
        </Button>
      )}
    </AlbumContainer>
  )
}

export default AlbumItem
