import UserList from './UserList'

const FollowingList = ({ userId }) => {
  return <UserList userId={userId} filterType="following" />
}

export default FollowingList
