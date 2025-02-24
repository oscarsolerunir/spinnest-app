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

const UserConversations = () => {
  const [user] = useAuthState(auth)
  const [conversations, setConversations] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const fetchConversations = async () => {
        const convos = await getConversationsByUser(user.uid)
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
        setConversations(convosWithUserNames)
      }

      fetchConversations()

      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      )
      const unsubscribe = onSnapshot(q, snapshot => {
        const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
    await markConversationAsRead(conversationId)
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
                convo.read ? 'font-normal' : 'font-bold'
              }`}
            >
              <strong>{convo.userName}</strong> - {convo.lastMessage} -{' '}
              {convo.read ? 'Leído' : 'No leído'}
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
