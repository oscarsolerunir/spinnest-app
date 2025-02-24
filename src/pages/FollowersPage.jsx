import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import UserList from '../components/Users/UserList'

const FollowersPage = () => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Seguidores</h1>
      <UserList userId={user.uid} filterType="followers" />
    </div>
  )
}

export default FollowersPage
