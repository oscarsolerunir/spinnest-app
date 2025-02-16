import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import {
  addToMyAlbums,
  addToWishlist,
  removeFromWishlist,
  getCollections
} from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAlbums } from '../context/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'
import UserList from '../components/User/UserList'

const ExplorePage = () => {
  const { allAlbums, fetchAllAlbums } = useAlbums()
  const [collections, setCollections] = useState([])
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllAlbums()
    handleGetCollections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGetCollections = async () => {
    const data = await getCollections()
    const sortedCollections = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    setCollections(sortedCollections)
  }

  const handleCollectionClick = id => {
    navigate(`/collection/${id}`, { state: { from: '/' } })
  }

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(user.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(user.uid, albumId)
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(user.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum:', error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Explorar</h1>
      <h2 className="text-xl font-semibold mb-2">Todos los álbumes</h2>
      <AlbumsList
        albums={allAlbums}
        showCollectedBy={false}
        showWishlistButton={true}
        handleAddToWishlist={handleAddToWishlist}
        handleRemoveFromWishlist={handleRemoveFromWishlist}
        handleAddToMyAlbums={handleAddToMyAlbums}
      />

      <h2 className="text-xl font-semibold mb-2">Todas las colecciones</h2>
      <ListCollections
        collections={collections}
        onClick={handleCollectionClick}
        allUsers
      />

      <h2 className="text-xl font-semibold mb-2">Todos los usuarios</h2>
      {user ? (
        <UserList userId={user.uid} />
      ) : (
        <p>Inicia sesión para ver usuarios.</p>
      )}
    </div>
  )
}

export default ExplorePage
