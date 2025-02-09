import { useState, useEffect } from 'react'
import {
  followUser,
  unfollowUser,
  getUsers,
  getAlbumsByUser,
  getCollectionsByUser,
  getConversationsByUser,
  createConversation
} from '../../services/api'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useNavigate } from 'react-router-dom'

const UserList = ({ userId, filterType }) => {
  const [users, setUsers] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [userAlbums, setUserAlbums] = useState({})
  const [userCollections, setUserCollections] = useState({})
  const navigate = useNavigate()

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

      return () => {
        unsubscribeFollowing()
        unsubscribeFollowers()
      }
    }
  }, [userId])

  const fetchUsers = async () => {
    const data = await getUsers()
    setUsers(data.filter(u => u.id !== userId))

    // Fetch albums and collections for each user
    const albumsPromises = data.map(async user => {
      const albums = await getAlbumsByUser(user.id)
      return { userId: user.id, count: albums.length }
    })

    const collectionsPromises = data.map(async user => {
      const collections = await getCollectionsByUser(user.id)
      return { userId: user.id, count: collections.length }
    })

    const albumsData = await Promise.all(albumsPromises)
    const collectionsData = await Promise.all(collectionsPromises)

    const albumsMap = {}
    const collectionsMap = {}

    albumsData.forEach(item => {
      albumsMap[item.userId] = item.count
    })

    collectionsData.forEach(item => {
      collectionsMap[item.userId] = item.count
    })

    setUserAlbums(albumsMap)
    setUserCollections(collectionsMap)
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

  const handleSendMessage = async recipientId => {
    try {
      const conversations = await getConversationsByUser(userId)
      let conversation = conversations.find(convo =>
        convo.participants.includes(recipientId)
      )

      if (!conversation) {
        const conversationId = await createConversation([userId, recipientId])
        conversation = { id: conversationId }
      }

      navigate(`/messages/${conversation.id}`)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleUserClick = userId => {
    navigate(`/user/${userId}`)
  }

  const filteredUsers = () => {
    switch (filterType) {
      case 'followers':
        return followers
          .map(f => users.find(u => u.id === f.followerId))
          .filter(Boolean)
      case 'following':
        return following
          .map(f => users.find(u => u.id === f.followingId))
          .filter(Boolean)
      default:
        return users
    }
  }

  const filteredUsersList = filteredUsers()

  return (
    <div>
      {filteredUsersList.length > 0 ? (
        <ul>
          {filteredUsersList.map(u => (
            <li
              key={u.id}
              onClick={() => handleUserClick(u.id)}
              style={{ cursor: 'pointer' }}
            >
              {u.name} - {userAlbums[u.id] || 0} álbums y{' '}
              {userCollections[u.id] || 0} colecciones
              {following.some(f => f.followingId === u.id) ? (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleUnfollow(u.id)
                  }}
                >
                  Dejar de seguir
                </button>
              ) : (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleFollow(u.id)
                  }}
                >
                  Seguir
                </button>
              )}
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleSendMessage(u.id)
                }}
              >
                Enviar mensaje
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {filterType === 'followers'
            ? 'Aún no tienes seguidores.'
            : filterType === 'following'
            ? 'Aún no sigues a ningún usuario.'
            : 'No se encontraron usuarios.'}
        </p>
      )}
    </div>
  )
}

export default UserList
