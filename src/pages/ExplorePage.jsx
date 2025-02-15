import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import {
  getCollections,
  addToWishlist,
  removeFromWishlist
} from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useAlbums } from '../context/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'
import UserList from '../components/User/UserList'

const ExplorePage = () => {
  const { albums, fetchAllAlbums } = useAlbums()
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
      console.log('Álbum añadido a wishlist')
      // Aquí podrías actualizar el estado local o el contexto, según lo necesites
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(user.uid, albumId)
      console.log('Álbum eliminado de wishlist')
      // Aquí podrías actualizar el estado local o el contexto, según lo necesites
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  return (
    <div>
      <h1>Explorar</h1>
      <h2>Todos los álbumes</h2>
      <AlbumsList
        albums={albums}
        showCollectedBy={false}
        showWishlistButton={true} // Se indica que se deben mostrar los botones de wishlist
        handleAddToWishlist={handleAddToWishlist}
        handleRemoveFromWishlist={handleRemoveFromWishlist}
      />

      <h2>Todas las colecciones</h2>
      <ListCollections
        collections={collections}
        onClick={handleCollectionClick}
        allUsers
      />

      <h2>Todos los usuarios</h2>
      {user ? (
        <UserList userId={user.uid} />
      ) : (
        <p>Inicia sesión para ver usuarios.</p>
      )}
    </div>
  )
}

export default ExplorePage
