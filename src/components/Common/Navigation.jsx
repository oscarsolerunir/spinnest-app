import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut } from '../../services/firebase'
import styled from 'styled-components'

const NavContainer = styled.nav`
  background-color: #333;
  padding: 10px;
  ul {
    list-style: none;
    display: flex;
    justify-content: space-around;
    padding: 0;
    margin: 0;
  }
  li {
    margin: 0 10px;
  }
  a,
  button {
    color: white;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }
  a:hover,
  button:hover {
    text-decoration: underline;
  }
`

const Navigation = () => {
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
            <Link to="/albums">Albms</Link>
          </li>
          <li>
            <Link to="/collections">Collections</Link>
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

export default Navigation
