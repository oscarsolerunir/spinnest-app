import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import { useNavigate } from 'react-router-dom'
import { getConversationsByUser } from '../../services/api'

const MessagesList = () => {
  const [user] = useAuthState(auth)
  const [conversations, setConversations] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const fetchConversations = async () => {
        const convos = await getConversationsByUser(user.uid)
        setConversations(convos)
      }

      fetchConversations()
    }
  }, [user])

  const handleConversationClick = conversationId => {
    navigate(`/messages/${conversationId}`)
  }

  return (
    <div>
      <h2>Mensajes</h2>
      <ul>
        {conversations.map(convo => (
          <li key={convo.id} onClick={() => handleConversationClick(convo.id)}>
            {convo.participants.filter(uid => uid !== user.uid).join(', ')} -{' '}
            {convo.read ? 'Leído' : 'No leído'}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MessagesList
