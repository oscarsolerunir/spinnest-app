import UserList from './UserList'

const FollowersList = ({ userId }) => {
  return <UserList userId={userId} filterType="followers" />
}

export default FollowersList
