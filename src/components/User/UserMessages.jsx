import { useState, useEffect, useRef } from 'react'
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
  const [typingUserName, setTypingUserName] = useState('')
  const [userNames, setUserNames] = useState({})
  const messagesEndRef = useRef(null)

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
        scrollToBottom()
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
    scrollToBottom()
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 px-6 py-4 rounded-xl text-lg grow ${
              msg.senderId === user.uid
                ? 'bg-primary text-black justify-self-end block max-w-lg'
                : 'bg-darkaccent text-light justify-self-start block max-w-lg'
            }`}
          >
            <p>
              <strong>
                {msg.senderId === user.uid
                  ? 'Yo'
                  : userNames[msg.senderId] || 'Desconocido'}
                :
              </strong>{' '}
              {msg.text}
            </p>
            <p
              className={`text-sm ${
                msg.senderId === user.uid ? 'text-dark' : 'text-light'
              }`}
            >
              {new Date(msg.timestamp.toDate()).toLocaleString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {isTyping && (
        <p className="text-sm text-light p-2">
          {typingUserName} está escribiendo...
        </p>
      )}
      <div className="flex items-center p-4 border-t border-darkaccent">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onInput={handleTyping}
          onFocus={handleTyping}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 p-4 text-lg border-none rounded-full bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

export default UserMessages
