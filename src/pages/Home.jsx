import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import ViewAllAlbums from './Albums/ViewAllAlbums'
import Login from '../components/User/Login'

const Home = () => {
  const [user] = useAuthState(auth)

  return (
    <div>
      <h1>Welcome to Spinnest</h1>
      <p>Share your records collection with your friends</p>
      {user ? <ViewAllAlbums /> : <Login />}
    </div>
  )
}

export default Home
