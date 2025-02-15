import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { getCollections } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAlbums } from '../context/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'
import UserList from '../components/User/UserList'

const ExplorePage = () => {
  const { albums, fetchAllAlbums } = useAlbums()
  const [collections, setCollections] = useState([])
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllAlbums()
    handleGetCollections()
  }, [])

  const handleGetCollections = async () => {
    const data = await getCollections()
    const sortedCollections = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    setCollections(sortedCollections)
  }

  const handleCollectionClick = id => {
    navigate(`/collection/${id}`, { state: { from: '/' } })
  }

  return (
    <div>
      <h1>Explorar</h1>
      <h2>Todos los álbumes</h2>
      <AlbumsList albums={albums} showCollectedBy={false} />

      <h2>Todas las colecciones</h2>
      <ListCollections
        collections={collections}
        onClick={handleCollectionClick}
        allUsers
      />

      <h2>Todos los usuarios</h2>
      {user ? (
        <UserList userId={user.uid} />
      ) : (
        <p>Inicia sesión para ver usuarios.</p>
      )}
    </div>
  )
}

export default ExplorePage
