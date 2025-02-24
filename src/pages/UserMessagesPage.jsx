import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import UserMessages from '../components/User/UserMessages'

const UserMessagesPage = () => {
  const { conversationId } = useParams()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUserName = async () => {
      const conversationDoc = await getDoc(
        doc(db, 'conversations', conversationId)
      )
      if (conversationDoc.exists()) {
        const conversationData = conversationDoc.data()
        const otherUserId = conversationData.participants.find(
          uid => uid !== auth.currentUser.uid
        )
        const userDoc = await getDoc(doc(db, 'users', otherUserId))
        if (userDoc.exists()) {
          setUserName(userDoc.data().name)
        }
      }
    }

    fetchUserName()
  }, [conversationId])

  return (
    <div className="py-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Mensajes con {userName}</h2>
      <UserMessages conversationId={conversationId} />
    </div>
  )
}

export default UserMessagesPage
