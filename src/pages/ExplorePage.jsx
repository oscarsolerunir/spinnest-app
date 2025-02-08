import { useState, useEffect } from 'react'
import { getAlbums } from '../services/api'
import ListAlbums from '../components/Albums/ListAlbums'
import { useNavigate } from 'react-router-dom'
import AllUsersList from '../components/User/AllUsersList'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const ExplorePage = () => {
  const [albums, setAlbums] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    handleGetAlbums()
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

  const handleAlbumClick = id => {
    navigate(`/album/${id}`, { state: { from: '/' } })
  }

  return (
    <div>
      <h1>Todos los álbums</h1>
      <ListAlbums albums={albums} onClick={handleAlbumClick} />
      {user && <AllUsersList userId={user.uid} />}
    </div>
  )
}

export default ExplorePage
