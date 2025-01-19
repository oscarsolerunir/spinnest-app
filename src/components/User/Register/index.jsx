import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../../services/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async e => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const user = userCredential.user

      // Guardar el nombre del usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email
      })

      alert('User registered successfully')
      navigate('/') // Redirigir a la página de inicio
    } catch (error) {
      console.error('Error registering user:', error)
      alert('Error registering user')
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <label>Name:</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
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
      <button type="submit">Register</button>
    </form>
  )
}

export default Register
