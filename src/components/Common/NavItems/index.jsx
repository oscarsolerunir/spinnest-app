import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut } from '../../../services/firebase'
import { NavContainer } from './styles'

const NavItems = () => {
  const [user] = useAuthState(auth)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      // Redirigir o mostrar mensaje de éxito
    } catch (error) {
      console.error('Error signing out:', error)
      // Mostrar mensaje de error
    }
  }

  return (
    <NavContainer>
      {user && (
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/collection">My Collection</Link>
          </li>
          <li>
            <Link to="/upload-album">Upload Album</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <button onClick={handleSignOut}>Sign Out</button>
          </li>
        </ul>
      )}
    </NavContainer>
  )
}

export default NavItems
