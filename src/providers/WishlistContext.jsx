import { createContext, useContext, useState, useEffect } from 'react'
import { getWishlist } from '../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [currentUser] = useAuthState(auth)
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    if (currentUser) {
      getWishlist(currentUser.uid).then(data => setWishlist(data))
    }
  }, [currentUser])

  const addToWishlistContext = album => {
    setWishlist(prevWishlist => [...prevWishlist, album])
  }

  const removeFromWishlistContext = albumId => {
    setWishlist(prevWishlist =>
      prevWishlist.filter(album => album.id !== albumId)
    )
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlistContext,
        removeFromWishlistContext
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  return useContext(WishlistContext)
}
