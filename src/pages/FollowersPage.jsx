import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import FollowersList from '../components/User/FollowersList'

const FollowersPage = () => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1>Seguidores</h1>
      <FollowersList userId={user.uid} />
    </div>
  )
}

export default FollowersPage
