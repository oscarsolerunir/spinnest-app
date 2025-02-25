import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { useAlbums } from '../contexts/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import CollectionsList from '../components/Collections/CollectionsList'
import {
  addToMyAlbums,
  addToWishlist,
  removeFromWishlist,
  followUser,
  unfollowUser,
  getConversationsByUser,
  createConversation,
  getUserById,
  getCollectionsByUser,
  getFollowingUsers
} from '../services/api'
import { FaEnvelope } from 'react-icons/fa'

const UserProfilePage = () => {
  const { userId: selectedUserId } = useParams()
  const navigate = useNavigate()
  const { allAlbums } = useAlbums()
  const [filteredAlbums, setFilteredAlbums] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])
  const [currentUser] = useAuthState(auth)
  const [following, setFollowing] = useState(false)
  const [userName, setUserName] = useState('usuario')

  useEffect(() => {
    if (allAlbums && allAlbums.length > 0) {
      const userAlbums = allAlbums.filter(album => {
        return album.userIds && album.userIds.includes(selectedUserId)
      })
      setFilteredAlbums(userAlbums)
    }
  }, [allAlbums, selectedUserId])

  useEffect(() => {
    // Obtener los datos del usuario seleccionado
    const fetchUserData = async () => {
      try {
        const userData = await getUserById(selectedUserId)
        setUserName(userData.name)
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error)
      }
    }

    fetchUserData()

    // Obtener las colecciones del usuario seleccionado
    const fetchUserCollections = async () => {
      try {
        const collections = await getCollectionsByUser(selectedUserId)
        setFilteredCollections(collections)
      } catch (error) {
        console.error('Error obteniendo colecciones del usuario:', error)
      }
    }

    fetchUserCollections()

    // Verificar si el usuario actual sigue al usuario seleccionado
    const checkFollowingStatus = async () => {
      try {
        const followingUsers = await getFollowingUsers(currentUser.uid)
        const isFollowing = followingUsers.some(
          user => user.followingId === selectedUserId
        )
        setFollowing(isFollowing)
      } catch (error) {
        console.error('Error verificando estado de seguimiento:', error)
      }
    }

    checkFollowingStatus()
  }, [selectedUserId, currentUser])

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum a mis albums:', error)
    }
  }

  const handleFollow = async () => {
    try {
      await followUser(currentUser.uid, selectedUserId)
      setFollowing(true)
    } catch (error) {
      console.error('Error siguiendo al usuario:', error)
    }
  }

  const handleUnfollow = async () => {
    try {
      await unfollowUser(currentUser.uid, selectedUserId)
      setFollowing(false)
    } catch (error) {
      console.error('Error dejando de seguir al usuario:', error)
    }
  }

  const handleSendMessage = async () => {
    try {
      const conversations = await getConversationsByUser(currentUser.uid)
      let conversation = conversations.find(convo =>
        convo.participants.includes(selectedUserId)
      )

      if (!conversation) {
        const conversationId = await createConversation([
          currentUser.uid,
          selectedUserId
        ])
        conversation = { id: conversationId }
      }

      navigate(`/messages/${conversation.id}`)
    } catch (error) {
      console.error('Error enviando mensaje:', error)
    }
  }

  return (
    <div>
      <div className="flex md:items-center flex-col md:flex-row justify-between">
        <h1 className="text-2xl font-medium mb-3">Perfil de {userName}</h1>
        {currentUser && currentUser.uid !== selectedUserId && (
          <div className="mb-6 flex items-end font-medium gap-6">
            {following ? (
              <button
                onClick={handleUnfollow}
                className="px-4 py-2 bg-neutral text-dark rounded-full hover:bg-neutralaccent"
              >
                Dejar de seguir
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className="px-4 py-2 bg-primary text-dark text-medium rounded-full hover:bg-accent"
              >
                Seguir
              </button>
            )}
            <button
              onClick={handleSendMessage}
              className="py-2 mt-3 text-light flex items-center"
            >
              <FaEnvelope className="mr-2" />
              Enviar mensaje
            </button>
          </div>
        )}
      </div>
      <h2 className="text-xl font-medium mb-2">Álbumes del Usuario</h2>
      {filteredAlbums && filteredAlbums.length > 0 ? (
        <AlbumsList
          albums={filteredAlbums}
          showCollectedBy={false}
          showWishlistButton={true}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddToMyAlbums={handleAddToMyAlbums}
        />
      ) : (
        <p>{userName} usuario no tiene álbumes agregados.</p>
      )}
      <h2 className="text-xl font-medium mb-2">Colecciones de {userName}</h2>
      {filteredCollections && filteredCollections.length > 0 ? (
        <CollectionsList collections={filteredCollections} />
      ) : (
        <p>{userName} no tiene colecciones agregadas.</p>
      )}
    </div>
  )
}

export default UserProfilePage
