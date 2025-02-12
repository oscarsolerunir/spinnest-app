import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addToMyAlbums,
  removeFromMyAlbums
} from '../services/api'
import AlbumItem from '../components/Albums/AlbumItem'

const WishlistPage = () => {
  const [albums, setAlbums] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser) {
      getWishlist(currentUser.uid).then(data => setAlbums(data))
    }
  }, [currentUser])

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
      setAlbums(prevAlbums => [...prevAlbums, album])
    } catch (error) {
      console.error('Error adding album to wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async album => {
    try {
      await removeFromWishlist(currentUser.uid, album.id)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== album.id))
    } catch (error) {
      console.error('Error removing album from wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
      setAlbums(prevAlbums => [...prevAlbums, album])
    } catch (error) {
      console.error('Error adding album to my albums:', error)
    }
  }

  const handleRemoveFromMyAlbums = async album => {
    try {
      await removeFromMyAlbums(currentUser.uid, album.id)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== album.id))
    } catch (error) {
      console.error('Error removing album from my albums:', error)
    }
  }

  return (
    <div>
      <h1>Mi Wishlist</h1>
      {albums.length > 0 ? (
        <div>
          {albums.map(album => (
            <AlbumItem
              key={album.id}
              album={album}
              userId={currentUser?.uid}
              isInWishlist={true} // Indicar que el álbum está en la wishlist
              isInMyAlbums={false} // Indicar si el álbum está en "mis albums"
              handleAddToWishlist={handleAddToWishlist}
              handleRemoveFromWishlist={handleRemoveFromWishlist}
              handleAddToMyAlbums={handleAddToMyAlbums}
              handleRemoveFromMyAlbums={handleRemoveFromMyAlbums}
            />
          ))}
        </div>
      ) : (
        <p>Aún no has añadido ningún álbum a la wishlist.</p>
      )}
    </div>
  )
}

export default WishlistPage
