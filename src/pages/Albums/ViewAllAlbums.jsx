import { useState, useEffect } from 'react'
import { getAlbums, getUsers } from '../../services/api'
import ListAlbums from '../../components/Albums/ListAlbums'
import { useNavigate } from 'react-router-dom'
import UserList from '../../components/User/UserList'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'

const AllAlbums = () => {
  const [albums, setAlbums] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    handleGetAlbums()
  }, [])

  const [user] = useAuthState(auth)
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (user) {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    const data = await getUsers()
    setUsers(data.filter(u => u.id !== user.uid))
  }

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
      <UserList
        title="Usuarios"
        users={users}
        following={[]}
        onFollow={() => {}}
        onUnfollow={() => {}}
      />
    </div>
  )
}

export default AllAlbums
