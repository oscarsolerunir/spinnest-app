import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../services/firebase'
import { useNavigate } from 'react-router-dom'
import {
  getConversationsByUser,
  markConversationAsRead
} from '../../services/api'
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where
} from 'firebase/firestore'

const MessagesList = () => {
  const [user] = useAuthState(auth)
  const [conversations, setConversations] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const fetchConversations = async () => {
        console.log('Fetching conversations for user:', user.uid)
        const convos = await getConversationsByUser(user.uid)
        console.log('Conversations fetched:', convos)
        const convosWithUserNames = await Promise.all(
          convos.map(async convo => {
            const otherUserId = convo.participants.find(uid => uid !== user.uid)
            const userDoc = await getDoc(doc(db, 'users', otherUserId))
            const userName = userDoc.exists()
              ? userDoc.data().name
              : 'Desconocido'
            return { ...convo, userName }
          })
        )
        console.log('Conversations with user names:', convosWithUserNames)
        setConversations(convosWithUserNames)
      }

      fetchConversations()

      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      )
      const unsubscribe = onSnapshot(q, snapshot => {
        const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('Snapshot conversations:', convos)
        const convosWithUserNames = Promise.all(
          convos.map(async convo => {
            const otherUserId = convo.participants.find(uid => uid !== user.uid)
            const userDoc = await getDoc(doc(db, 'users', otherUserId))
            const userName = userDoc.exists()
              ? userDoc.data().name
              : 'Desconocido'
            return { ...convo, userName }
          })
        )
        convosWithUserNames.then(setConversations)
      })

      return () => unsubscribe()
    }
  }, [user])

  const handleConversationClick = async conversationId => {
    console.log('Marking conversation as read:', conversationId)
    await markConversationAsRead(conversationId)
    navigate(`/messages/${conversationId}`)
  }

  return (
    <div>
      <h2>Mensajes</h2>
      <ul>
        {conversations.map(convo => (
          <li
            key={convo.id}
            onClick={() => handleConversationClick(convo.id)}
            style={{ fontWeight: convo.read ? 'normal' : 'bold' }} // Indicador visual para conversaciones no leídas
          >
            <strong>{convo.userName}</strong> - {convo.lastMessage} -{' '}
            {convo.read ? 'Leído' : 'No leído'}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MessagesList
