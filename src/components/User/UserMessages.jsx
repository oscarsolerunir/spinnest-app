import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, rtdb } from '../../services/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore'
import { ref, set, onValue, remove } from 'firebase/database'

const UserMessages = ({ recipientId }) => {
  const [user] = useAuthState(auth)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [userNames, setUserNames] = useState({})

  useEffect(() => {
    if (user && recipientId) {
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', user.uid),
        orderBy('timestamp')
      )

      const unsubscribe = onSnapshot(q, async snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
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
      })

      const typingRef = ref(rtdb, `typing/${recipientId}`)
      onValue(typingRef, snapshot => {
        setIsTyping(snapshot.val() === user.uid)
      })

      return () => {
        unsubscribe()
        remove(ref(rtdb, `typing/${user.uid}`)) // Limpiar el estado de escritura al desmontar el componente
      }
    }
  }, [user, recipientId])

  const handleSendMessage = async () => {
    if (message.trim() === '') return

    await addDoc(collection(db, 'messages'), {
      text: message,
      senderId: user.uid,
      recipientId,
      participants: [user.uid, recipientId],
      timestamp: new Date()
    })

    setMessage('')
    remove(ref(rtdb, `typing/${user.uid}`)) // Limpiar el estado de escritura al enviar el mensaje
  }

  const handleTyping = () => {
    set(ref(rtdb, `typing/${user.uid}`), recipientId)
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
