import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import {
  updateEmail,
  updatePassword,
  deleteUser,
  sendEmailVerification
} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

const UserProfileForm = () => {
  const [user] = useAuthState(auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
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
    setError('')
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
          await sendEmailVerification(user)
          alert(
            'Verification email sent. Please verify your new email before logging in again.'
          )
        }
        if (password) {
          await updatePassword(user, password)
        }

        alert('Changes saved successfully')
      }
    } catch {
      setError('Error updating user. Please try again.')
    }
  }

  const handleDeleteAccount = async () => {
    setError('')
    try {
      if (user) {
        // Delete user from Firestore
        await deleteDoc(doc(db, 'users', user.uid))

        // Delete user from Auth
        await deleteUser(user)

        alert('User account deleted successfully')
        navigate('/login') // Redirigir a la página de inicio de sesión
      }
    } catch {
      setError('Error deleting user. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSaveChanges} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Perfil de usuario</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre:
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email:
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contraseña:
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Borrar cuenta
        </button>
      </div>
    </form>
  )
}

export default UserProfileForm
