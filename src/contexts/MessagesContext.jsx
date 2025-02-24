import { createContext, useContext, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, rtdb } from '../services/firebase'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore'
import { ref, onValue, remove, set } from 'firebase/database'
import { addMessage, getMessagesByConversation } from '../services/api'

const MessagesContext = createContext()

export const useMessages = () => {
  return useContext(MessagesContext)
}

export const MessagesProvider = ({ children }) => {
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUserName, setTypingUserName] = useState('')
  const [userNames, setUserNames] = useState({})

  const fetchMessages = async conversationId => {
    if (!user || !conversationId) return

    const msgs = await getMessagesByConversation(conversationId)
    setMessages(msgs)

    const userIds = new Set(msgs.map(msg => msg.senderId))
    const names = {}
    for (const userId of userIds) {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        names[userId] = userDoc.data().name
      }
    }
    setUserNames(names)
  }

  const subscribeToMessages = conversationId => {
    if (!user || !conversationId) return

    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp')
    )
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMessages(msgs)

      const userIds = new Set(msgs.map(msg => msg.senderId))
      const names = { ...userNames }
      for (const userId of userIds) {
        if (!names[userId]) {
          getDoc(doc(db, 'users', userId)).then(userDoc => {
            if (userDoc.exists()) {
              names[userId] = userDoc.data().name
              setUserNames(names)
            }
          })
        }
      }
    })

    return unsubscribe
  }

  const subscribeToTyping = conversationId => {
    if (!user || !conversationId) return

    const typingRef = ref(rtdb, `typing/${conversationId}`)
    onValue(typingRef, async snapshot => {
      const typingUsers = snapshot.val() || {}
      const typingUserIds = Object.keys(typingUsers).filter(
        uid => uid !== user.uid
      )
      setIsTyping(typingUserIds.length > 0)

      if (typingUserIds.length > 0) {
        const typingUserId = typingUserIds[0]
        const userDoc = await getDoc(doc(db, 'users', typingUserId))
        if (userDoc.exists()) {
          setTypingUserName(userDoc.data().name)
        }
      } else {
        setTypingUserName('')
      }
    })
  }

  const unsubscribeFromTyping = conversationId => {
    if (!user || !conversationId) return

    remove(ref(rtdb, `typing/${conversationId}/${user.uid}`))
  }

  const handleSendMessage = async (conversationId, message) => {
    if (!user || !conversationId || message.trim() === '') return

    await addMessage(conversationId, user.uid, message)
    remove(ref(rtdb, `typing/${conversationId}/${user.uid}`))
  }

  const handleTyping = conversationId => {
    if (!user || !conversationId) return

    set(ref(rtdb, `typing/${conversationId}/${user.uid}`), true)
  }

  const handleBlur = conversationId => {
    if (!user || !conversationId) return

    remove(ref(rtdb, `typing/${conversationId}/${user.uid}`))
  }

  return (
    <MessagesContext.Provider
      value={{
        messages,
        isTyping,
        typingUserName,
        userNames,
        fetchMessages,
        subscribeToMessages,
        subscribeToTyping,
        unsubscribeFromTyping,
        handleSendMessage,
        handleTyping,
        handleBlur
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
