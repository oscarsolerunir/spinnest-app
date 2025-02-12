import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { getWishlist, removeFromWishlist } from '../services/api'
import AlbumItem from '../components/Albums/AlbumItem'

const WishlistPage = () => {
  const [albums, setAlbums] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser) {
      getWishlist(currentUser.uid).then(data => {
        console.log('📥 Wishlist obtenida de Firebase:', data)
        setAlbums(data)
      })
    }
  }, [currentUser]) // 🔹 Asegurar que se recarga cuando cambia el usuario

  const handleRemoveFromWishlist = async album => {
    try {
      await removeFromWishlist(currentUser.uid, album.id)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== album.id))
    } catch (error) {
      console.error('❌ Error al eliminar de wishlist:', error)
    }
  }

  return (
    <div>
      <h1>Mi Wishlist</h1>
      {albums.length > 0 ? (
        <div>
          {albums.map(item => (
            <AlbumItem
              key={item.id}
              album={item.albumDetails} // 🔹 Se asegura de que tenga los detalles completos del álbum
              userId={currentUser?.uid}
              isInWishlist={true}
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
