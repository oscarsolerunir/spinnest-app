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
  const { userId: selectedUserId } = useParams()
  const { allAlbums } = useAlbums()
  const [filteredAlbums, setFilteredAlbums] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (allAlbums && allAlbums.length > 0) {
      const userAlbums = allAlbums.filter(album => {
        return album.userIds && album.userIds.includes(selectedUserId)
      })
      setFilteredAlbums(userAlbums)
    }
  }, [allAlbums, selectedUserId])

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum a mis albums:', error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Perfil de Usuario</h1>
      <h2 className="text-xl font-semibold mb-2">Álbumes del Usuario</h2>
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
