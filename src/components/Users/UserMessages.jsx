import { useMessages } from '../../contexts/MessagesContext'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import { useState, useEffect, useRef } from 'react'

const UserMessages = ({ conversationId }) => {
  const [user] = useAuthState(auth)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)
  const {
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
  } = useMessages()

  useEffect(() => {
    if (!user) {
      console.error('No hay usuario autenticado.')
      return
    }

    if (user && conversationId) {
      fetchMessages(conversationId)
      const unsubscribeMessages = subscribeToMessages(conversationId)
      subscribeToTyping(conversationId)

      return () => {
        unsubscribeMessages()
        unsubscribeFromTyping(conversationId)
      }
    }
  }, [user, conversationId])

  const handleSend = async () => {
    await handleSendMessage(conversationId, message)
    setMessage('')
    scrollToBottom()
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
          onInput={() => handleTyping(conversationId)}
          onFocus={() => handleTyping(conversationId)}
          onBlur={() => handleBlur(conversationId)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
          className="flex-1 p-4 text-lg border-none rounded-full bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

export default UserMessages
