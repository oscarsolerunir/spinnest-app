import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'wishlist'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        albumId: doc.data().albumId,
        albumName: doc.data().albumName,
        albumArtist: doc.data().albumArtist || 'Artista desconocido',
        albumYear: doc.data().albumYear || 'Año desconocido',
        albumGenre: doc.data().albumGenre || 'Género desconocido',
        albumLabel: doc.data().albumLabel || 'Sello desconocido',
        albumImage: doc.data().albumImage || '',
        isInWishlist: true,
        userId: doc.data().userId // Asegúrate de incluir el userId
      }))
      setWishlist(data)
    })

    return () => unsubscribe()
  }, [currentUser])

  const addToWishlistContext = album => {
    setWishlist(prev => [...prev, album])
  }

  const removeFromWishlistContext = albumId => {
    setWishlist(prev => prev.filter(item => item.albumId !== albumId))
  }

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlistContext, removeFromWishlistContext }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
