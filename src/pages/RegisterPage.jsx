import { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
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
    <div className="max-w-md mx-auto my-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a Spinnest</h1>
      <p className="mb-4">Comparte tu colección de discos con tus amigos</p>
      <form onSubmit={handleRegister} className="space-y-4">
        <h2 className="text-2xl font-semibold mb-2">Register</h2>
        <div>
          <label className="block text-sm font-medium text-gray mb-3">
            Nombre:
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="mb-4 p-4 text-lg block w-full bg-darkgray rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray mb-3">
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mb-4 p-4 text-lg block w-full bg-darkgray rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray mb-3">
            Contraseña:
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mb-4 p-4 text-lg block w-full bg-darkgray rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold"
        >
          {loading ? 'Registrando usuario...' : 'Regístrate'}
        </button>
        <p className="mt-4 block text-center">
          ¿Tienes cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
