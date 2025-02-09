import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import ExplorePage from './ExplorePage'
import Login from '../components/Auth/Login'

const Home = () => {
  const [user, loading] = useAuthState(auth)

  if (loading) {
    return <div>Cargando...</div>
  }

  return <div>{user ? <ExplorePage /> : <Login />}</div>
}

export default Home
