import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import ExplorePage from './ExplorePage'
import LoginPage from './LoginPage'

const HomePage = () => {
  const [user, loading] = useAuthState(auth)

  if (loading) {
    return <div>Cargando...</div>
  }

  return <div>{user ? <ExplorePage /> : <LoginPage />}</div>
}

export default HomePage
