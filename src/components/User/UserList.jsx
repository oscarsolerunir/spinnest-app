import { useNavigate } from 'react-router-dom'

const UserList = ({ title, users, following = [], onFollow, onUnfollow }) => {
  const navigate = useNavigate()

  const handleSendMessage = userId => {
    navigate(`/messages/${userId}`)
  }

  return (
    <div>
      <h2>{title}</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.name}
            {following.some(f => f.followingId === u.id) ? (
              <button onClick={() => onUnfollow(u.id)}>Dejar de seguir</button>
            ) : (
              <button onClick={() => onFollow(u.id)}>Seguir</button>
            )}
            <button onClick={() => handleSendMessage(u.id)}>
              Enviar mensaje
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserList
