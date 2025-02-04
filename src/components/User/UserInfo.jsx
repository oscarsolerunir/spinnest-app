import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'

const UserInfo = () => {
  const [user] = useAuthState(auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setName(userData.name)
          setEmail(userData.email)
        }
      }
      fetchUserData()
    }
  }, [user])

  const handleEditProfile = () => {
    navigate('/edit-profile')
  }

  return (
    <div>
      <h2>Información del Usuario</h2>
      <p>
        <strong>Nombre:</strong> {name}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <button onClick={handleEditProfile}>Editar Perfil</button>
    </div>
  )
}

export default UserInfo
