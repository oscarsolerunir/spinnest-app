import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import UsersList from '../components/Users/UsersList'

const FollowersPage = () => {
  const [user] = useAuthState(auth)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-medium mb-4">Seguidores</h1>
      <UsersList userId={user.uid} filterType="followers" />
    </div>
  )
}

export default FollowersPage
