import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut } from '../../../services/firebase'

const NavItems = () => {
  const [user] = useAuthState(auth)

  const handleSignOut = () => {
    signOut(auth)
  }

  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      {user && (
        <>
          <li>
            <Link to="/collection">My Collection</Link>
          </li>
          <li>
            <Link to="/upload-album">Upload Album</Link>
          </li>
        </>
      )}
      {user ? (
        <>
          <li>
            <Link to="/user-profile">{user.email}</Link>
          </li>
          <li>
            <button onClick={handleSignOut}>Logout</button>
          </li>
        </>
      ) : (
        <>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </>
      )}
    </ul>
  )
}

export default NavItems
