import { useState, useEffect } from 'react'
import { getAlbumsByUser } from '../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import AlbumList from '../components/Albums/AlbumList'

const UserAlbumsPage = () => {
  const [albums, setAlbums] = useState([])
  const [user] = useAuthState(auth)

  useEffect(() => {
    if (user) {
      getAlbumsByUser(user.uid).then(data => setAlbums(data))
    }
  }, [user])

  return (
    <div>
      <h1>Tus albums</h1>
      {albums.length > 0 ? (
        <AlbumList albums={albums} />
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
