// AlbumsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const AlbumsContext = createContext()

export const AlbumsProvider = ({ children }) => {
  const [allAlbums, setAllAlbums] = useState([]) // Álbumes de toda la colección (para ExplorePage)
  const [userAlbums, setUserAlbums] = useState([]) // Álbumes del usuario autenticado (para páginas propias)
  const [currentUser] = useAuthState(auth)

  // Listener en tiempo real para TODOS los álbumes (sin filtro)
  useEffect(() => {
    const collRef = collection(db, 'albums')
    const unsubscribe = onSnapshot(
      collRef,
      snapshot => {
        const albumsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAllAlbums(albumsData)
      },
      error => {
        console.error('❌ Error en onSnapshot de todos los álbumes:', error)
      }
    )
    return () => unsubscribe()
  }, [])

  // Listener en tiempo real para los álbumes del usuario autenticado
  useEffect(() => {
    if (!currentUser) {
      setUserAlbums([])
      return
    }
    const q = query(
      collection(db, 'albums'),
      where('userIds', 'array-contains', currentUser.uid)
    )
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const albumsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUserAlbums(albumsData)
      },
      error => {
        console.error('❌ Error en onSnapshot de álbumes del usuario:', error)
      }
    )
    return () => unsubscribe()
  }, [currentUser])

  // Función para obtener todos los álbumes sin listener (opcional)
  const fetchAllAlbums = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'albums'))
      const albumsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAllAlbums(albumsData)
    } catch (error) {
      console.error('❌ Error fetching all albums:', error)
    }
  }

  // Función para obtener los álbumes del usuario autenticado sin listener (opcional)
  const fetchUserAlbums = async () => {
    if (!currentUser) return
    try {
      const q = query(
        collection(db, 'albums'),
        where('userIds', 'array-contains', currentUser.uid)
      )
      const snapshot = await getDocs(q)
      const albumsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUserAlbums(albumsData)
    } catch (error) {
      console.error('❌ Error fetching user albums:', error)
    }
  }

  // Funciones para actualizar el estado local
  const addAlbum = album => {
    setAllAlbums(prev => [...prev, album])
    if (
      currentUser &&
      album.userIds &&
      album.userIds.includes(currentUser.uid)
    ) {
      setUserAlbums(prev => [...prev, album])
    }
  }

  const removeAlbum = albumId => {
    setAllAlbums(prev => prev.filter(album => album.id !== albumId))
    setUserAlbums(prev => prev.filter(album => album.id !== albumId))
  }

  return (
    <AlbumsContext.Provider
      value={{
        allAlbums,
        userAlbums,
        fetchAllAlbums,
        fetchUserAlbums,
        addAlbum,
        removeAlbum,
        setAlbums: setAllAlbums // Si necesitas modificar directamente "allAlbums"
      }}
    >
      {children}
    </AlbumsContext.Provider>
  )
}

export const useAlbums = () => useContext(AlbumsContext)
