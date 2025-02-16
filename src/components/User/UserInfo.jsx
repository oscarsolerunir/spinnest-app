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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Información del Usuario</h2>
      <p className="mb-2">
        <strong>Nombre:</strong> {name}
      </p>
      <p className="mb-4">
        <strong>Email:</strong> {email}
      </p>
      <button
        onClick={handleEditProfile}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Editar Perfil
      </button>
    </div>
  )
}

export default UserInfo
