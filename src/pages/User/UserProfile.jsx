import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import FollowersList from '../../components/User/FollowersList'
import UserProfileForm from '../../components/User/UserProfileForm'

const UserProfile = () => {
  const [user] = useAuthState(auth)

  return (
    <div>
      <FollowersList userId={user?.uid} />
      <UserProfileForm />
    </div>
  )
}

export default UserProfile
