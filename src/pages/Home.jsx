import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { useNavigate } from 'react-router-dom'
import Login from '../components/User/Login'

const Home = () => {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/all-albums')
    }
  }, [user, navigate])

  return (
    <div>
      <h1>Welcome to Spinnest</h1>
      <p>Upload your record collection</p>
      {!user && <Login />}
    </div>
  )
}

export default Home
