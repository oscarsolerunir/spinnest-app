import { createContext, useContext, useState, useEffect } from 'react'
import { getAlbumsByUser } from '../services/api'
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

  const fetchUserAlbums = async () => {
    try {
      const userAlbums = await getAlbumsByUser(currentUser.uid)
      setAlbums(userAlbums)
    } catch (error) {
      console.error('Error fetching user albums:', error)
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
      value={{ albums, addAlbum, removeAlbum, fetchUserAlbums }}
    >
      {children}
    </AlbumsContext.Provider>
  )
}

export const useAlbums = () => {
  return useContext(AlbumsContext)
}
