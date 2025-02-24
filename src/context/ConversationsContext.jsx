import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../services/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
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
      setConversations(convos)
    }

    fetchConversations()

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
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
