import { useAuthState } from 'react-firebase-hooks/auth'
import { Navigate } from 'react-router-dom'
import { auth } from '../../services/firebase'

const PrivateRoute = ({ children }) => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}

export default PrivateRoute
