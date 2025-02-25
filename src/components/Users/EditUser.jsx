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

const EditUser = () => {
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
    <form onSubmit={handleSaveChanges} className="space-y-4 max-w-3xl mx-0">
      <h2 className="text-2xl font-medium mb-4">Perfil de usuario</h2>
      <div>
        <label className="block text-sm font-medium text-light mb-3">
          Nombre:
        </label>
        <input
          type="text"
          value={name}
          placeholder="Escribe tu nombre"
          onChange={e => setName(e.target.value)}
          className="mb-4 p-4 text-lg block w-full border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light mb-3">
          Email:
        </label>
        <input
          type="email"
          value={email}
          placeholder="Escribe tu email"
          onChange={e => setEmail(e.target.value)}
          className="mb-4 p-4 text-lg block w-full border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light mb-3">
          Contraseña:
        </label>
        <input
          type="password"
          value={password}
          placeholder="Escribe aquí tu contraseña"
          onChange={e => setPassword(e.target.value)}
          className="mb-4 p-4 text-lg block w-full border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex space-x-2">
        <button
          type="submit"
          className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-medium"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-red-500 hover:bg-red-600 text-lg font-medium"
        >
          Borrar cuenta
        </button>
      </div>
    </form>
  )
}

export default EditUser
