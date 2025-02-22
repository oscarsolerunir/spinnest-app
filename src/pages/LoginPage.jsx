import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'

const LoginPage = () => {
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

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      alert('User logged in successfully')
      navigate('/')
    } catch {
      setError(
        'Error logging in user. Please check your credentials and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a Spinnest</h1>
      <p className="mb-4">
        Organiza y comparte tu colección de discos con tus amigos
      </p>
      <form onSubmit={handleLogin} className="space-y-4">
        <h2 className="text-2xl font-semibold mb-2">Login</h2>
        <div>
          <label className="block text-sm font-medium text-light mb-3">
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mb-4 p-4 text-lg block w-full bg-darkaccent rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light mb-3">
            Contraseña:
          </label>
          <input
            type="contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mb-4 p-4 text-lg block w-full bg-darkaccent rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
        <p className="mt-4 block text-center">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
