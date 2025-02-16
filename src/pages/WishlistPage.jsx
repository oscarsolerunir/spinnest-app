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

        // Transformar los datos al formato esperado por AlbumsList
        const formattedAlbums = data.map(item => ({
          id: item.albumId,
          name: item.albumName,
          artist: item.albumArtist || 'Artista desconocido',
          year: item.albumYear || 'Año desconocido',
          genre: item.albumGenre || 'Género desconocido',
          label: item.albumLabel || 'Sello desconocido',
          image: item.albumImage || '',
          isInWishlist: true
        }))

        setAlbums(formattedAlbums)
      }

      fetchWishlist()
    }
  }, [currentUser])

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== albumId))
    } catch (error) {
      console.error('❌ Error al eliminar de wishlist:', error)
    }
  }

  return (
    <div>
      <h1>Mi Wishlist</h1>
      <AlbumsList
        albums={albums}
        showWishlistButton={true}
        wishlistOnly={true} // Indica que estamos en WishlistPage
        handleRemoveFromWishlist={handleRemoveFromWishlist}
        showCollectedBy={false}
      />
    </div>
  )
}

export default WishlistPage
