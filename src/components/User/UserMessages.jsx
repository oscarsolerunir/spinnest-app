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
    if (user && conversationId) {
      const fetchMessages = async () => {
        const msgs = await getMessagesByConversation(conversationId)
        setMessages(msgs)

        // Obtener nombres de usuarios
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
        setIsTyping(snapshot.val() === user.uid)
      })

      // Marcar la conversación como leída
      markConversationAsRead(conversationId)

      // Suscribirse a los cambios en los mensajes
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp')
      )
      const unsubscribe = onSnapshot(q, snapshot => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setMessages(msgs)
      })

      return () => {
        unsubscribe()
        remove(ref(rtdb, `typing/${user.uid}`)) // Limpiar el estado de escritura al desmontar el componente
      }
    }
  }, [user, conversationId])

  const handleSendMessage = async () => {
    if (message.trim() === '') return

    await addMessage(conversationId, user.uid, message) // Usar la función addMessage

    setMessage('')
    remove(ref(rtdb, `typing/${user.uid}`)) // Limpiar el estado de escritura al enviar el mensaje
  }

  const handleTyping = () => {
    set(ref(rtdb, `typing/${user.uid}`), conversationId)
  }

  const handleBlur = () => {
    remove(ref(rtdb, `typing/${user.uid}`)) // Limpiar el estado de escritura al perder el foco
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div>
      <div>
        {messages.map(msg => (
          <div key={msg.id}>
            <p>
              <strong>
                {msg.senderId === user.uid
                  ? 'Yo'
                  : userNames[msg.senderId] || 'Desconocido'}
                :
              </strong>{' '}
              {msg.text}
            </p>
            <p>{new Date(msg.timestamp.toDate()).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {isTyping && <p>El usuario está escribiendo...</p>}
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onInput={handleTyping}
        onFocus={handleTyping}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown} // Añadir el evento onKeyDown
      />
      <button onClick={handleSendMessage}>Enviar</button>
    </div>
  )
}

export default UserMessages
