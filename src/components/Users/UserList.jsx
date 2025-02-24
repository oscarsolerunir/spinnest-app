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
import { FaEnvelope } from 'react-icons/fa'

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
    try {
      const data = await getUsers()

      if (!data || data.length === 0) {
        setUsers([])
        return
      }

      setUsers(data.filter(u => u.id !== userId))

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
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
    }
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
      {filteredUsersList.length > 0 ? (
        filteredUsersList.map(u => (
          <div
            key={u.id}
            onClick={() => handleUserClick(u.id)}
            className="rounded-2xl p-4 cursor-pointer mb-5 transition-transform transform hover:bg-darkaccent"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg truncate">{u.name}</p>
                <p className="text-light truncate">
                  {userAlbums[u.id] || 0} álbums y {userCollections[u.id] || 0}{' '}
                  colecciones
                </p>
              </div>
            </div>
            <div className="space-x-2 mt-4">
              {following.some(f => f.followingId === u.id) ? (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleUnfollow(u.id)
                  }}
                  className="px-4 py-2 bg-darkaccent text-light rounded-full hover:bg-dark"
                >
                  Dejar de seguir
                </button>
              ) : (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleFollow(u.id)
                  }}
                  className="px-4 py-2 bg-primary text-dark text-medium rounded-full hover:bg-accent"
                >
                  Seguir
                </button>
              )}
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleSendMessage(u.id)
                }}
                className="py-2 mt-3 text-light flex items-center"
              >
                <FaEnvelope className="mr-2" />
                Enviar mensaje
              </button>
            </div>
          </div>
        ))
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
