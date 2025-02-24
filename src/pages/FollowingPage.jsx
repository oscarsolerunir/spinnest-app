import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import UserList from '../components/Users/UserList'

const FollowingPage = () => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Siguiendo</h1>
      <UserList userId={user.uid} filterType="following" />
    </div>
  )
}

export default FollowingPage
