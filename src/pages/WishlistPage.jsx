import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { getWishlist, removeFromWishlist, addToMyAlbums } from '../services/api'
import AlbumsList from '../components/Albums/AlbumsList'
import { useWishlist } from '../contexts/WishlistContext'
import { useAlbums } from '../contexts/AlbumsContext'

const WishlistPage = () => {
  const [albums, setAlbums] = useState([])
  const [currentUser] = useAuthState(auth)
  const { wishlist, removeFromWishlistContext } = useWishlist()
  const { addAlbum } = useAlbums()

  useEffect(() => {
    if (currentUser) {
      const fetchWishlist = async () => {
        const data = await getWishlist(currentUser.uid)

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
  }, [currentUser, wishlist])

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
      setAlbums(prev => prev.filter(a => a.id !== albumId))
      removeFromWishlistContext(albumId)
    } catch (error) {
      console.error('Error al eliminar de wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
      await removeFromWishlist(currentUser.uid, album.id)
      removeFromWishlistContext(album.id)
      setAlbums(prev => prev.filter(a => a.id !== album.id))
      addAlbum(album)
    } catch (error) {
      console.error('Error añadiendo álbum a mis álbumes:', error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
      {albums.length > 0 ? (
        <AlbumsList
          albums={albums}
          showCollectedBy={false}
          showWishlistButton={true}
          wishlistOnly={true}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddToMyAlbums={handleAddToMyAlbums}
        />
      ) : (
        <p className="mt-4">No hay álbumes en tu wishlist.</p>
      )}
    </div>
  )
}

export default WishlistPage
