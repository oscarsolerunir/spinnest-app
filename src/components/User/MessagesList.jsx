import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../services/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const MessagesList = () => {
  const [user] = useAuthState(auth)
  const [users, setUsers] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', user.uid)
      )
      const unsubscribe = onSnapshot(q, snapshot => {
        const usersMap = {}
        const unreadMap = {}
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          const otherUserId = data.participants.find(uid => uid !== user.uid)
          if (!usersMap[otherUserId]) {
            usersMap[otherUserId] = { id: otherUserId, messages: [] }
          }
          usersMap[otherUserId].messages.push(data)
          if (!data.read && data.recipientId === user.uid) {
            unreadMap[otherUserId] = (unreadMap[otherUserId] || 0) + 1
          }
        })
        setUsers(Object.values(usersMap))
        setUnreadCounts(unreadMap)
      })
      return () => unsubscribe()
    }
  }, [user])

  const handleUserClick = userId => {
    navigate(`/messages/${userId}`)
  }

  return (
    <div>
      <h2>Mensajes</h2>
      <ul>
        {users.map(u => (
          <li key={u.id} onClick={() => handleUserClick(u.id)}>
            {u.id} -{' '}
            {unreadCounts[u.id]
              ? `${unreadCounts[u.id]} nuevos mensajes`
              : 'No hay mensajes nuevos'}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MessagesList
