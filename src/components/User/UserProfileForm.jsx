import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { updateEmail, updatePassword, deleteUser } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

const UserProfileForm = () => {
  const [user] = useAuthState(auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  const handleSaveChanges = async e => {
    e.preventDefault()
    try {
      if (user) {
        // Update Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          name,
          email
        })

        // Update Auth
        if (email !== user.email) {
          await updateEmail(user, email)
        }
        if (password) {
          await updatePassword(user, password)
        }

        alert('Changes saved successfully')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (user) {
        // Delete user from Firestore
        await deleteDoc(doc(db, 'users', user.uid))

        // Delete user from Auth
        await deleteUser(user)

        alert('User account deleted successfully')
        navigate('/login') // Redirigir a la página de inicio de sesión
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  return (
    <form onSubmit={handleSaveChanges}>
      <h2>Perfil de usuario</h2>
      <label>Nombre:</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <label>Contraseña:</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Leave blank to keep current password"
      />
      <button type="submit">Guardar cambios</button>
      <button type="button" onClick={handleDeleteAccount}>
        Borrar cuenta
      </button>
    </form>
  )
}

export default UserProfileForm
