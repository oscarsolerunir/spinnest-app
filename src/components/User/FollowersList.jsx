import { useState, useEffect } from 'react'
import {
  getFollowers,
  getFollowingUsers,
  followUser,
  unfollowUser,
  getUsers
} from '../../services/api'
import UserList from './UserList'

const FollowersList = ({ userId }) => {
  const [users, setUsers] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])

  useEffect(() => {
    if (userId) {
      fetchUsers()
      fetchFollowers()
      fetchFollowing()
    }
  }, [userId])

  const fetchUsers = async () => {
    const data = await getUsers()
    setUsers(data.filter(u => u.id !== userId))
  }

  const fetchFollowers = async () => {
    const data = await getFollowers(userId)
    setFollowers(data)
  }

  const fetchFollowing = async () => {
    const data = await getFollowingUsers(userId)
    setFollowing(data)
  }

  const handleFollow = async followingId => {
    try {
      await followUser(userId, followingId)
      fetchUsers()
      fetchFollowing()
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleUnfollow = async followingId => {
    try {
      await unfollowUser(userId, followingId)
      fetchUsers()
      fetchFollowing()
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
