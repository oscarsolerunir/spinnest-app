import { useEffect } from 'react'
import { useAlbums } from '../context/AlbumsContext'
import { removeFromMyAlbums } from '../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import AlbumsList from '../components/Albums/AlbumsList'

const UserAlbumsPage = () => {
  // Usamos userAlbums en lugar de albums
  const { userAlbums, fetchUserAlbums, removeAlbum } = useAlbums()
  const [user] = useAuthState(auth)

  useEffect(() => {
    if (user) {
      fetchUserAlbums()
    }
  }, [user])

  // Función para eliminar álbum de manera reactiva
  const handleRemoveFromMyAlbums = async albumId => {
    try {
      await removeFromMyAlbums(user.uid, albumId)
      removeAlbum(albumId) // Actualiza el estado global en AlbumsContext
    } catch (error) {
      console.error('❌ Error eliminando álbum de mis albums:', error)
    }
  }

  return (
    <div>
      <h1>Tus álbumes</h1>
      {userAlbums.length > 0 ? (
        <AlbumsList
          albums={userAlbums}
          handleRemoveFromMyAlbums={handleRemoveFromMyAlbums}
        />
      ) : (
        <p>No has añadido ningún álbum todavía.</p>
      )}
      <Link to="/add-album">
        <button>Añadir álbum</button>
      </Link>
    </div>
  )
}

export default UserAlbumsPage
