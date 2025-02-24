import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'

const UserContext = createContext()

export const useUser = () => {
  return useContext(UserContext)
}

export const UserProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(auth)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data())
        }
      }

      fetchUserData()
    } else {
      setUserData(null)
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, userData, loading, error }}>
      {children}
    </UserContext.Provider>
  )
}
