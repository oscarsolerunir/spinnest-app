import { useState, useEffect } from 'react'
import {
  getAlbums,
  getCollections,
  addToWishlist,
  removeFromWishlist,
  addToMyAlbums,
  removeFromMyAlbums
} from '../services/api'
import AlbumItem from '../components/Albums/AlbumItem'
import ListCollections from '../components/Collections/ListCollections'
import UserList from '../components/User/UserList'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const ExplorePage = () => {
  const [albums, setAlbums] = useState([])
  const [collections, setCollections] = useState([])
  const [wishlist] = useState([])
  const navigate = useNavigate()
  const [user] = useAuthState(auth)

  useEffect(() => {
    handleGetAlbums()
    handleGetCollections()
  }, [])

  const handleGetAlbums = () => {
    getAlbums().then(data => {
      // Ordenar álbumes por fecha de creación en orden descendente
      const sortedAlbums = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setAlbums(sortedAlbums)
    })
  }

  const handleGetCollections = () => {
    getCollections().then(data => {
      // Ordenar colecciones por fecha de creación en orden descendente
      const sortedCollections = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setCollections(sortedCollections)
    })
  }

  const handleCollectionClick = id => {
    navigate(`/collection/${id}`, { state: { from: '/' } })
  }

  // ✅ Funciones reactivas
  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(user.uid, album)
      setAlbums(prevAlbums =>
        prevAlbums.map(a =>
          a.id === album.id ? { ...a, isInMyAlbums: true } : a
        )
      )
    } catch (error) {
      console.error('❌ Error añadiendo álbum a mis albums:', error)
    }
  }

  const handleRemoveFromMyAlbums = async albumId => {
    try {
      await removeFromMyAlbums(user.uid, albumId)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== albumId)) // 🔹 Ahora desaparece sin recargar
    } catch (error) {
      console.error('❌ Error eliminando álbum de mis albums:', error)
    }
  }

  return (
    <div>
      <h1>Explorar</h1>
      <h2>Todos los álbums</h2>
      {albums.length > 0 ? (
        <div>
          {albums.map(album => (
            <AlbumItem
              key={album.id}
              album={album}
              userId={user?.uid}
              handleAddToMyAlbums={handleAddToMyAlbums}
              handleRemoveFromMyAlbums={handleRemoveFromMyAlbums} // 🔹 Se pasa la función para eliminar
            />
          ))}
        </div>
      ) : (
        <p>No hay álbums disponibles.</p>
      )}
      <h2>Todas las colecciones</h2>
      <ListCollections
        collections={collections}
        onClick={handleCollectionClick}
        allUsers
      />
      <h2>Todos los usuarios</h2>
      <UserList userId={user?.uid} />
    </div>
  )
}

export default ExplorePage
