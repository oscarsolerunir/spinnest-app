import { useState, useEffect } from 'react'
import { followUser, unfollowUser, getUsers } from '../../services/api'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import UserList from './UserList'

const FollowersList = ({ userId }) => {
  const [users, setUsers] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])

  useEffect(() => {
    if (userId) {
      fetchUsers()

      const qFollowers = query(
        collection(db, 'follows'),
        where('followingId', '==', userId)
      )
      const unsubscribeFollowers = onSnapshot(qFollowers, snapshot => {
        const followersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setFollowers(followersData)
      })

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
        unsubscribeFollowers()
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

  const filteredUsers = users.filter(
    u =>
      !followers.some(f => f.followerId === u.id) &&
      !following.some(f => f.followingId === u.id)
  )

  return (
    <div>
      <UserList
        title="Usuarios"
        users={filteredUsers}
        following={following}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />
      <UserList
        title="Seguidores"
        users={followers.map(f => users.find(u => u.id === f.followerId))}
        following={following}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />
      <UserList
        title="Siguiendo"
        users={following.map(f => users.find(u => u.id === f.followingId))}
        following={following}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />
    </div>
  )
}

export default FollowersList
