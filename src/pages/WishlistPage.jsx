import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { getWishlist } from '../services/api'
import AlbumList from '../components/Albums/AlbumList'

const WishlistPage = () => {
  const [albums, setAlbums] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser) {
      getWishlist(currentUser.uid).then(data => setAlbums(data))
    }
  }, [currentUser])

  return (
    <div>
      <h1>Mi Wishlist</h1>
      {albums.length > 0 ? (
        <AlbumList albums={albums} />
      ) : (
        <p>Aún no has añadido ningún álbum a la wishlist.</p>
      )}
    </div>
  )
}

export default WishlistPage
