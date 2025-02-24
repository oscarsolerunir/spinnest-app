import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
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
  const [feedAlbums, setFeedAlbums] = useState([]) // Álbumes para el feed
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

  // Función para obtener los álbumes del feed (usuarios seguidos)
  const fetchFeedAlbums = useCallback(
    async followingIds => {
      if (!currentUser || followingIds.length === 0) return
      try {
        const q = query(
          collection(db, 'albums'),
          where('userIds', 'array-contains-any', followingIds)
        )
        const snapshot = await getDocs(q)
        const albumsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setFeedAlbums(albumsData)
      } catch (error) {
        console.error('❌ Error fetching feed albums:', error)
      }
    },
    [currentUser]
  ) // La función se volverá a crear solo si currentUser cambia

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
    // Actualizamos la lista global "allAlbums":
    setAllAlbums(prev =>
      prev
        .map(album => {
          if (album.id === albumId && album.userIds) {
            // Eliminamos el id del usuario actual de userIds
            const updatedUserIds = album.userIds.filter(
              id => id !== currentUser.uid
            )
            // Si tras quitar el id no queda nadie, eliminamos el álbum del listado global
            if (updatedUserIds.length === 0) {
              return null
            }
            // Sino, devolvemos el álbum actualizado
            return { ...album, userIds: updatedUserIds }
          }
          return album
        })
        .filter(album => album !== null)
    )

    // En el listado de "mis álbumes" (userAlbums) sí lo removemos
    setUserAlbums(prev => prev.filter(album => album.id !== albumId))
  }

  return (
    <AlbumsContext.Provider
      value={{
        allAlbums,
        userAlbums,
        fetchAllAlbums,
        fetchUserAlbums,
        feedAlbums,
        fetchFeedAlbums,
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
