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
  const [wishlist, setWishlist] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser) {
      getWishlist(currentUser.uid).then(setWishlist)
    }
  }, [currentUser])

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
      setWishlist(prevWishlist => [...prevWishlist, { albumDetails: album }])
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async album => {
    try {
      await removeFromWishlist(currentUser.uid, album.id)
      setWishlist(prevWishlist =>
        prevWishlist.filter(item => item.albumDetails.id !== album.id)
      )
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  return (
    <div>
      <h1>Mi Wishlist</h1>
      {wishlist.length > 0 ? (
        <div>
          {wishlist.map(item => (
            <AlbumItem
              key={item.id}
              album={item.albumDetails} // 🔹 Se asegura de que tenga los detalles completos del álbum
              userId={currentUser?.uid}
              isInWishlist={true}
              handleAddToWishlist={handleAddToWishlist}
              handleRemoveFromWishlist={handleRemoveFromWishlist}
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
