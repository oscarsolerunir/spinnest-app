import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import FollowingList from '../components/User/FollowingList'

const FollowingPage = () => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1>Siguiendo</h1>
      <FollowingList userId={user.uid} />
    </div>
  )
}

export default FollowingPage
