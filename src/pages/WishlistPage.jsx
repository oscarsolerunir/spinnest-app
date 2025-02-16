import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { getWishlist, removeFromWishlist, addToMyAlbums } from '../services/api'
import AlbumsList from '../components/Albums/AlbumsList'
import { useWishlist } from '../context/WishlistContext'
import { useAlbums } from '../context/AlbumsContext'

const WishlistPage = () => {
  const [albums, setAlbums] = useState([])
  const [currentUser] = useAuthState(auth)
  const { wishlist, removeFromWishlistContext } = useWishlist()
  const { addAlbum } = useAlbums()

  // Obtener la wishlist del usuario actual
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
  }, [currentUser, wishlist]) // Dependencia añadida: wishlist

  // Handler para eliminar un álbum de la wishlist
  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
      setAlbums(prev => prev.filter(a => a.id !== albumId))
      removeFromWishlistContext(albumId)
      console.log('Álbum eliminado de wishlist')
    } catch (error) {
      console.error('❌ Error al eliminar de wishlist:', error)
    }
  }

  // Handler para añadir un álbum a "mis álbumes"
  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
      console.log('✅ Álbum añadido a mis álbumes con éxito.')

      await removeFromWishlist(currentUser.uid, album.id)

      // 🔴 ACTUALIZA TAMBIÉN EL CONTEXTO DE LA WISHLIST
      removeFromWishlistContext(album.id)

      setAlbums(prev => prev.filter(a => a.id !== album.id))

      addAlbum(album)
    } catch (error) {
      console.error('⚠️ Error añadiendo álbum a mis álbumes:', error)
    }
  }

  return (
    <div>
      <h1>Mi Wishlist</h1>
      {albums.length > 0 ? (
        <AlbumsList
          albums={albums}
          showCollectedBy={false}
          showWishlistButton={true}
          wishlistOnly={true} // Indica que estamos en WishlistPage
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddToMyAlbums={handleAddToMyAlbums}
        />
      ) : (
        <p>No hay álbumes en tu wishlist.</p>
      )}
    </div>
  )
}

export default WishlistPage
