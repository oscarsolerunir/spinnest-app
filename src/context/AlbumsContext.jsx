import { createContext, useContext, useState, useEffect } from 'react'
import { getAlbums, getAlbumsByUser } from '../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const AlbumsContext = createContext()

export const AlbumsProvider = ({ children }) => {
  const [albums, setAlbums] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser) {
      fetchUserAlbums()
    }
  }, [currentUser])

  // 🔹 Obtiene los álbumes del usuario autenticado
  const fetchUserAlbums = async () => {
    if (!currentUser) return
    try {
      const userAlbums = await getAlbumsByUser(currentUser.uid)
      setAlbums(userAlbums)
    } catch (error) {
      console.error('❌ Error fetching user albums:', error)
    }
  }

  // 🔹 Obtiene los álbumes de todos los usuarios (para ExplorePage)
  const fetchAllAlbums = async () => {
    try {
      const allAlbums = await getAlbums()
      setAlbums(allAlbums)
    } catch (error) {
      console.error('❌ Error fetching all albums:', error)
    }
  }

  const addAlbum = album => {
    setAlbums(prevAlbums => [...prevAlbums, album])
  }

  const removeAlbum = albumId => {
    setAlbums(prevAlbums => prevAlbums.filter(album => album.id !== albumId))
  }

  return (
    <AlbumsContext.Provider
      value={{ albums, addAlbum, removeAlbum, fetchUserAlbums, fetchAllAlbums }}
    >
      {children}
    </AlbumsContext.Provider>
  )
}

export const useAlbums = () => {
  return useContext(AlbumsContext)
}
