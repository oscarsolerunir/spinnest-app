import { useEffect, useState } from 'react'
import { useAlbums } from '../context/AlbumsContext'
import { removeFromMyAlbums } from '../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import AlbumsList from '../components/Albums/AlbumsList'

const UserAlbumsPage = () => {
  const { userAlbums, fetchUserAlbums, removeAlbum } = useAlbums()
  const [user] = useAuthState(auth)
  const [setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserAlbums()
    }
  }, [user, fetchUserAlbums])

  const handleRemoveFromMyAlbums = async albumId => {
    try {
      await removeFromMyAlbums(user.uid, albumId)
      removeAlbum(albumId)
    } catch {
      setError(
        'Error eliminando álbum de mis albums. Por favor, inténtalo de nuevo.'
      )
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tus álbumes</h1>
      <Link to="/add-album">
        <button className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold">
          Añadir álbum
        </button>
      </Link>
      {userAlbums.length > 0 ? (
        <AlbumsList
          albums={userAlbums}
          handleRemoveFromMyAlbums={handleRemoveFromMyAlbums}
        />
      ) : (
        <p>No has añadido ningún álbum todavía.</p>
      )}
    </div>
  )
}

export default UserAlbumsPage
