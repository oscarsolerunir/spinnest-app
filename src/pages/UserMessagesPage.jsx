import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import UserMessages from '../components/User/UserMessages'

const UserMessagesPage = () => {
  const { userId } = useParams()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUserName = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        setUserName(userDoc.data().name)
      } else {
        console.error('No such user!')
      }
    }

    fetchUserName()
  }, [userId])

  return (
    <div>
      <h2>Mensajes con {userName}</h2>
      <UserMessages recipientId={userId} />
    </div>
  )
}

export default UserMessagesPage
