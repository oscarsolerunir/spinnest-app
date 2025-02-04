import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut, db } from '../../services/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
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
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'messages'),
        where('recipientId', '==', user.uid),
        where('read', '==', false)
      )

      const unsubscribe = onSnapshot(q, snapshot => {
        setUnreadCount(snapshot.size)
      })

      return () => unsubscribe()
    }
  }, [user])

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
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/albums">Albums</Link>
          </li>
          <li>
            <Link to="/collections">Colecciones</Link>
          </li>
          <li>
            <Link to="/messages">
              Mensajes {unreadCount > 0 && `(${unreadCount})`}
            </Link>
          </li>
          <li>
            <Link to="/profile">Perfil</Link>
          </li>
          <li>
            <button onClick={handleSignOut}>Cerrar sesión</button>
          </li>
        </ul>
      )}
    </NavContainer>
  )
}

export default Navigation
