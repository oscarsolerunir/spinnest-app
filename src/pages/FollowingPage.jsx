import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import UserList from '../components/User/UserList'

const FollowingPage = () => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1>Siguiendo</h1>
      <UserList userId={user.uid} filterType="following" />
    </div>
  )
}

export default FollowingPage
