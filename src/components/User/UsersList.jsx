import { useState, useEffect } from 'react'
import { followUser, unfollowUser, getUsers } from '../../services/api'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import UserList from './UserList'

const UsersList = ({ userId }) => {
  const [users, setUsers] = useState([])
  const [following, setFollowing] = useState([])

  useEffect(() => {
    if (userId) {
      fetchUsers()

      const qFollowing = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      )
      const unsubscribeFollowing = onSnapshot(qFollowing, snapshot => {
        const followingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setFollowing(followingData)
      })

      return () => {
        unsubscribeFollowing()
      }
    }
  }, [userId])

  const fetchUsers = async () => {
    const data = await getUsers()
    setUsers(data.filter(u => u.id !== userId))
  }

  const handleFollow = async followingId => {
    try {
      await followUser(userId, followingId)
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleUnfollow = async followingId => {
    try {
      await unfollowUser(userId, followingId)
    } catch (error) {
      console.error('Error unfollowing user:', error)
    }
  }

  return (
    <div>
      <UserList
        title="Usuarios"
        users={users}
        following={following}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />
    </div>
  )
}

export default UsersList
