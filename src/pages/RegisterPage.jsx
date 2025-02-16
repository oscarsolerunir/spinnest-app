import { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'

const Register = () => {
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
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user
      console.log('Usuario creado en Auth:', user)

      // Actualizar el perfil para asignar displayName
      await updateProfile(user, { displayName: name })
      // Forzar recarga para que se actualice el objeto usuario
      await user.reload()
      const updatedUser = auth.currentUser
      console.log('Usuario actualizado con displayName:', updatedUser)

      // Guardar en Firestore usando el displayName actualizado
      await setDoc(doc(db, 'users', updatedUser.uid), {
        name: updatedUser.displayName || 'Usuario desconocido',
        email
      })
      console.log(
        'Documento de usuario creado en Firestore para UID:',
        updatedUser.uid
      )

      alert('User registered successfully')
      navigate('/')
    } catch (error) {
      console.error('Error registering user:', error)
      setError('Error registering user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleRegister}>
        <h2>Register</h2>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register
