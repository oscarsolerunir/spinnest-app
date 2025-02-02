import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import ViewAllAlbums from './Albums/ViewAllAlbums'
import Login from '../components/User/Login'

const Home = () => {
  const [user] = useAuthState(auth)

  return <div>{user ? <ViewAllAlbums /> : <Login />}</div>
}

export default Home
