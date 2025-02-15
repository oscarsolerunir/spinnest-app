import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const UserContext = createContext()

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [user] = useAuthState(auth)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (user) {
      setUserId(user.uid)
    } else {
      setUserId(null)
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, userId }}>
      {children}
    </UserContext.Provider>
  )
}
