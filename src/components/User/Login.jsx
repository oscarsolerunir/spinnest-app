import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async e => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      alert('User logged in successfully')
      navigate('/')
    } catch (error) {
      console.error('Error logging in user:', error)
      alert('Error logging in user')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      <p>
        Not have an account? <Link to="/register">Register here</Link>
      </p>
    </form>
  )
}

export default Login
