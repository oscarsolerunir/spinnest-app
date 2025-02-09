import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  getAlbumsByUser,
  getCollectionsByUser,
  getUserById,
  followUser,
  unfollowUser,
  getConversationsByUser,
  createConversation
} from '../services/api'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import AlbumList from '../components/Albums/AlbumList'
import ListCollections from '../components/Collections/ListCollections'
import { useNavigate } from 'react-router-dom'

const UserPage = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [albums, setAlbums] = useState([])
  const [collections, setCollections] = useState([])
  const [following, setFollowing] = useState([])
  const [currentUser] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserById(userId)
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    const fetchAlbums = async () => {
      try {
        const albumsData = await getAlbumsByUser(userId)
        setAlbums(albumsData)
      } catch (error) {
        console.error('Error fetching albums:', error)
      }
    }

    const fetchCollections = async () => {
      try {
        const collectionsData = await getCollectionsByUser(userId)
        setCollections(collectionsData)
      } catch (error) {
        console.error('Error fetching collections:', error)
      }
    }

    fetchUserData()
    fetchAlbums()
    fetchCollections()
  }, [userId])

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const qFollowing = query(
        collection(db, 'follows'),
        where('followerId', '==', currentUser.uid)
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
  }, [currentUser])

  const handleFollow = async () => {
    if (!currentUser || !currentUser.uid) return
    try {
      await followUser(currentUser.uid, userId)
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const handleUnfollow = async () => {
    if (!currentUser || !currentUser.uid) return
    try {
      await unfollowUser(currentUser.uid, userId)
    } catch (error) {
      console.error('Error unfollowing user:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!currentUser || !currentUser.uid) return
    try {
      const conversations = await getConversationsByUser(currentUser.uid)
      let conversation = conversations.find(convo =>
        convo.participants.includes(userId)
      )

      if (!conversation) {
        const conversationId = await createConversation([
          currentUser.uid,
          userId
        ])
        conversation = { id: conversationId }
      }

      navigate(`/messages/${conversation.id}`)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  const isFollowing = following.some(f => f.followingId === userId)

  return (
    <div>
      <h1>{user.name}</h1>
      {isFollowing ? (
        <button onClick={handleUnfollow}>Dejar de seguir</button>
      ) : (
        <button onClick={handleFollow}>Seguir</button>
      )}
      <button onClick={handleSendMessage}>Enviar mensaje</button>
      <h2>Álbums</h2>
      {albums.length > 0 ? (
        <AlbumList albums={albums} />
      ) : (
        <p>El usuario aún no ha añadido álbums.</p>
      )}
      <h2>Colecciones</h2>
      {collections.length > 0 ? (
        <ListCollections collections={collections} />
      ) : (
        <p>El usuario aún no ha creado colecciones.</p>
      )}
    </div>
  )
}

export default UserPage
