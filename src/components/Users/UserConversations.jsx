import { useConversations } from '../../contexts/ConversationsContext'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../services/firebase'

const UserConversations = () => {
  const { conversations, markAsRead } = useConversations()
  const navigate = useNavigate()

  const handleConversationClick = async conversationId => {
    await markAsRead(conversationId)
    navigate(`/messages/${conversationId}`)
  }

  return (
    <div className="py-4">
      {conversations.length > 0 ? (
        <ul className="space-y-2">
          {conversations.map(convo => (
            <li
              key={convo.id}
              onClick={() => handleConversationClick(convo.id)}
              className={`p-4 rounded-md bg-darkaccent hover:bg-dark cursor-pointer ${
                convo.readBy && convo.readBy.includes(auth.currentUser.uid)
                  ? 'font-normal'
                  : 'font-medium'
              }`}
            >
              <strong>{convo.userName}</strong> - {convo.lastMessage} -{' '}
              {convo.readBy && convo.readBy.includes(auth.currentUser.uid)
                ? 'Leído'
                : 'No leído'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no has recibido ningún mensaje.</p>
      )}
    </div>
  )
}

export default UserConversations
