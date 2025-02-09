import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import UserList from '../components/User/UserList'

const FollowersPage = () => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1>Seguidores</h1>
      <UserList userId={user.uid} filterType="followers" />
    </div>
  )
}

export default FollowersPage
