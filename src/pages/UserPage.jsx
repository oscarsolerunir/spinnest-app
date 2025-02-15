import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getAlbumsByUser,
  getUserById,
  followUser,
  unfollowUser,
  getConversationsByUser,
  createConversation,
  addToWishlist,
  removeFromWishlist,
  addToMyAlbums,
  removeFromMyAlbums
} from '../services/api'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'

const UserPage = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [albums, setAlbums] = useState([])
  const [following, setFollowing] = useState([])
  const [wishlist, setWishlist] = useState([])
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

    fetchUserData()
    fetchAlbums()
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

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
      setWishlist(prevWishlist => [...prevWishlist, album])
    } catch (error) {
      console.error('Error adding album to wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
      setWishlist(prevWishlist => prevWishlist.filter(a => a.id !== albumId))
    } catch (error) {
      console.error('Error removing album from wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
      setAlbums(prevAlbums => [...prevAlbums, album])
    } catch (error) {
      console.error('Error adding album to my albums:', error)
    }
  }

  const handleRemoveFromMyAlbums = async albumId => {
    try {
      await removeFromMyAlbums(currentUser.uid, albumId)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== albumId))
    } catch (error) {
      console.error('Error removing album from my albums:', error)
    }
  }

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
        <AlbumsList
          albums={albums}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddToMyAlbums={handleAddToMyAlbums}
          handleRemoveFromMyAlbums={handleRemoveFromMyAlbums}
        />
      ) : (
        <p>El usuario aún no ha añadido álbumes.</p>
      )}
      <h2>Colecciones</h2>
      <ListCollections userId={userId} />
    </div>
  )
}

export default UserPage
