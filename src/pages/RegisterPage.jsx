import { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [user] = useAuthState(auth)

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleRegister = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      await updateProfile(user, { displayName: name })
      await user.reload()
      const updatedUser = auth.currentUser

      await setDoc(doc(db, 'users', updatedUser.uid), {
        name: updatedUser.displayName || 'Usuario desconocido',
        email
      })

      alert('User registered successfully')
      navigate('/')
    } catch {
      setError('Error registering user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md">
      <form onSubmit={handleRegister} className="space-y-4">
        <h2 className="text-2xl font-semibold mb-2">Register</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
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
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default RegisterPage
