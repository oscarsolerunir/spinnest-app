import { useNavigate } from 'react-router-dom'
import { getConversationsByUser, createConversation } from '../../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'

const UserList = ({ title, users, following = [], onFollow, onUnfollow }) => {
  const navigate = useNavigate()
  const [user] = useAuthState(auth)

  const handleSendMessage = async userId => {
    if (!user) return

    // Obtener las conversaciones del usuario actual
    const conversations = await getConversationsByUser(user.uid)

    // Buscar una conversación existente con el usuario seleccionado
    let conversation = conversations.find(convo =>
      convo.participants.includes(userId)
    )

    // Si no existe una conversación, crear una nueva
    if (!conversation) {
      const conversationId = await createConversation([user.uid, userId])
      conversation = { id: conversationId }
    }

    // Navegar a la conversación existente o recién creada
    navigate(`/messages/${conversation.id}`)
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
