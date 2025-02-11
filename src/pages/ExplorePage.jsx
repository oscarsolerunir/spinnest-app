import { useState, useEffect } from 'react'
import { getAlbums, getCollections } from '../services/api'
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
      // Sort albums by createdAt in descending order
      const sortedAlbums = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setAlbums(sortedAlbums)
    })
  }

  const handleGetCollections = () => {
    getCollections().then(data => {
      // Sort collections by createdAt in descending order
      const sortedCollections = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setCollections(sortedCollections)
    })
  }

  const handleCollectionClick = id => {
    navigate(`/collection/${id}`, { state: { from: '/' } })
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
              wishlist={wishlist}
              handleAddToWishlist={() => {}}
              handleRemoveFromWishlist={() => {}}
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
