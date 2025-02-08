import { useState, useEffect } from 'react'
import { getAlbums, getCollections } from '../services/api'
import ListAlbums from '../components/Albums/ListAlbums'
import ListCollections from '../components/Collections/ListCollections'
import { useNavigate } from 'react-router-dom'
import AllUsersList from '../components/User/AllUsersList'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const ExplorePage = () => {
  const [albums, setAlbums] = useState([])
  const [collections, setCollections] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    handleGetAlbums()
    handleGetCollections()
  }, [])

  const [user] = useAuthState(auth)

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

  const handleAlbumClick = id => {
    navigate(`/album/${id}`, { state: { from: '/' } })
  }

  const handleCollectionClick = id => {
    navigate(`/collection/${id}`, { state: { from: '/' } })
  }

  return (
    <div>
      <h1>Todos los álbums</h1>
      <ListAlbums albums={albums} onClick={handleAlbumClick} />
      <h1>Todas las colecciones</h1>
      <ListCollections
        collections={collections}
        onClick={handleCollectionClick}
      />
      {user && <AllUsersList userId={user.uid} />}
    </div>
  )
}

export default ExplorePage
