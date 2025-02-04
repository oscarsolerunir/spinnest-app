import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import FollowersList from '../../components/User/FollowersList'
import UserInfo from '../../components/User/UserInfo'

const UserProfile = () => {
  const [user] = useAuthState(auth)

  return (
    <div>
      <UserInfo />
      <FollowersList userId={user?.uid} />
    </div>
  )
}

export default UserProfile
