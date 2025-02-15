import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { getWishlist, removeFromWishlist } from '../services/api'
import AlbumsList from '../components/Albums/AlbumsList'

const WishlistPage = () => {
  const [albums, setAlbums] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser) {
      const fetchWishlist = async () => {
        const data = await getWishlist(currentUser.uid)
        console.log('📥 Wishlist obtenida de Firebase:', data)
        setAlbums(data)
      }

      fetchWishlist()
    }
  }, [currentUser])

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
      <AlbumsList
        albums={albums}
        onRemove={handleRemoveFromWishlist}
        showCollectedBy={false}
      />
    </div>
  )
}

export default WishlistPage
