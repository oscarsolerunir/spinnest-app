import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, rtdb } from '../../services/firebase'
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { ref, set, onValue, remove } from 'firebase/database'
import {
  addMessage,
  markConversationAsRead,
  getMessagesByConversation
} from '../../services/api'

const UserMessages = ({ conversationId }) => {
  const [user] = useAuthState(auth)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [userNames, setUserNames] = useState({})

  useEffect(() => {
    if (!user) {
      console.error('No hay usuario autenticado.')
      return
    }

    if (user && conversationId) {
      const fetchMessages = async () => {
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

      fetchMessages()

      const typingRef = ref(rtdb, `typing/${conversationId}`)
      onValue(typingRef, snapshot => {
        const typingUsers = snapshot.val() || {}
        const typingUserIds = Object.keys(typingUsers)
        setIsTyping(typingUserIds.some(uid => uid !== user.uid))
      })

      markConversationAsRead(conversationId)

      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp')
      )
      const unsubscribe = onSnapshot(q, async snapshot => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setMessages(msgs)

        const userIds = new Set(msgs.map(msg => msg.senderId))
        const names = { ...userNames }
        for (const userId of userIds) {
          if (!names[userId]) {
            const userDoc = await getDoc(doc(db, 'users', userId))
            if (userDoc.exists()) {
              names[userId] = userDoc.data().name
            }
          }
        }
        setUserNames(names)
      })

      return () => {
        unsubscribe()
        remove(ref(rtdb, `typing/${conversationId}/${user.uid}`))
      }
    }
  }, [user, conversationId])

  const handleSendMessage = async () => {
    if (message.trim() === '') return

    await addMessage(conversationId, user.uid, message)

    setMessage('')
    remove(ref(rtdb, `typing/${conversationId}/${user.uid}`))
  }

  const handleTyping = () => {
    set(ref(rtdb, `typing/${conversationId}/${user.uid}`), true)
  }

  const handleBlur = () => {
    remove(ref(rtdb, `typing/${conversationId}/${user.uid}`))
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        {messages.map(msg => (
          <div key={msg.id} className="mb-2">
            <p>
              <strong>
                {msg.senderId === user.uid
                  ? 'Yo'
                  : userNames[msg.senderId] || 'Desconocido'}
                :
              </strong>{' '}
              {msg.text}
            </p>
            <p className="text-sm text-light">
              {new Date(msg.timestamp.toDate()).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {isTyping && (
        <p className="text-sm text-light">El usuario está escribiendo...</p>
      )}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onInput={handleTyping}
          onFocus={handleTyping}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="mb-4 p-4 text-lg border-none rounded-full bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        />
        <button
          onClick={handleSendMessage}
          className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

export default UserMessages
