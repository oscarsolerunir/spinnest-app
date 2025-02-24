import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../services/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore'
import { getConversationsByUser, markConversationAsRead } from '../services/api'

const ConversationsContext = createContext()

export const useConversations = () => {
  return useContext(ConversationsContext)
}

export const ConversationsProvider = ({ children }) => {
  const [user] = useAuthState(auth)
  const [conversations, setConversations] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

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

    const unsubscribe = onSnapshot(q, async snapshot => {
      const convos = await Promise.all(
        snapshot.docs.map(async doc => {
          const convo = { id: doc.id, ...doc.data() }
          const otherUserId = convo.participants.find(uid => uid !== user.uid)
          const userDoc = await getDoc(doc(db, 'users', otherUserId))
          const userName = userDoc.exists()
            ? userDoc.data().name
            : 'Desconocido'
          return { ...convo, userName }
        })
      )
      setConversations(convos)

      const unreadConvos = convos.filter(
        convo => !convo.readBy || !convo.readBy.includes(user.uid)
      )
      setUnreadCount(unreadConvos.length)
    })

    return () => unsubscribe()
  }, [user])

  const markAsRead = async conversationId => {
    await markConversationAsRead(conversationId, user.uid)
  }

  return (
    <ConversationsContext.Provider
      value={{ conversations, unreadCount, markAsRead }}
    >
      {children}
    </ConversationsContext.Provider>
  )
}
