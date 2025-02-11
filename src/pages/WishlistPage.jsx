import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/api'
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
      console.log('🔄 Intentando añadir a wishlist:', album.name)
      await addToWishlist(currentUser.uid, album)

      console.log('🔄 Obteniendo wishlist actualizada...')
      const updatedWishlist = await getWishlist(currentUser.uid)

      console.log('✅ Nueva wishlist recibida:', updatedWishlist)

      if (updatedWishlist.length > 0) {
        setAlbums(updatedWishlist) // Actualiza el estado con la nueva lista
      } else {
        console.warn('⚠️ No se recibieron datos nuevos de Firebase.')
      }
    } catch (error) {
      console.error('❌ Error añadiendo a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async album => {
    try {
      await removeFromWishlist(currentUser.uid, album.id)

      // Obtener la wishlist actualizada después de eliminar el álbum
      const updatedWishlist = await getWishlist(currentUser.uid)
      setAlbums(updatedWishlist)
    } catch (error) {
      console.error('Error removing album from wishlist:', error)
    }
  }

  console.log('handleAddToWishlist en WishlistPage:', handleAddToWishlist)
  console.log(
    'handleRemoveFromWishlist en WishlistPage:',
    handleRemoveFromWishlist
  )

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
