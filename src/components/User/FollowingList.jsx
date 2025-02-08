import { useState, useEffect } from 'react'
import { unfollowUser, getUsers } from '../../services/api'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import UserList from './UserList'

const FollowingList = ({ userId }) => {
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
        title="Siguiendo"
        users={following.map(f => users.find(u => u.id === f.followingId))}
        following={following}
        onUnfollow={handleUnfollow}
      />
    </div>
  )
}

export default FollowingList
