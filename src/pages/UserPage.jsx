// UserPage.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { useAlbums } from '../context/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import {
  addToMyAlbums,
  addToWishlist,
  removeFromWishlist
} from '../services/api'

const UserPage = () => {
  // Obtenemos el uid del usuario que queremos ver desde la URL, por ejemplo: /user/:id
  const { userId: selectedUserId } = useParams()
  const { allAlbums } = useAlbums() // Usamos el array de todos los álbumes
  const [filteredAlbums, setFilteredAlbums] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    // Opcional: agregar logs para depurar
    console.log('UserPage - allAlbums:', allAlbums)
    console.log('UserPage - selectedUserId:', selectedUserId)
    if (allAlbums && allAlbums.length > 0) {
      const userAlbums = allAlbums.filter(album => {
        // Verificamos que el álbum tenga la propiedad userIds y que incluya el uid seleccionado
        return album.userIds && album.userIds.includes(selectedUserId)
      })
      console.log('UserPage - filteredAlbums:', userAlbums)
      setFilteredAlbums(userAlbums)
    }
  }, [allAlbums, selectedUserId])

  // Handlers: se reutilizan los mismos que en ExplorePage y FeedPage
  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
      console.log('Álbum añadido a wishlist')
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
      console.log('Álbum eliminado de wishlist')
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
      console.log('✅ Álbum añadido a mis albums con éxito.')
    } catch (error) {
      console.error('Error añadiendo álbum a mis albums:', error)
    }
  }

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      <h2>Álbumes del Usuario</h2>
      {filteredAlbums && filteredAlbums.length > 0 ? (
        <AlbumsList
          albums={filteredAlbums}
          showCollectedBy={false}
          showWishlistButton={true}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddToMyAlbums={handleAddToMyAlbums}
        />
      ) : (
        <p>Este usuario no tiene álbumes agregados.</p>
      )}
    </div>
  )
}

export default UserPage
