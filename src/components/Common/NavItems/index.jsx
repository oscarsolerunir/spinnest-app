import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { NavContainer } from './styles'

const NavItems = () => {
  const [user] = useAuthState(auth)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setUserName(userDoc.data().name)
        }
      }
    }

    fetchUserName()
  }, [user])

  return (
    <NavContainer>
      {user && (
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/my-albums">Mis albums</Link>
          </li>
          <li>
            <Link to="/my-collections">Mis colecciones</Link>
          </li>
          <li>
            <Link to="/profile">
              {userName ? `Hola, ${userName}` : 'Perfil'}
            </Link>
          </li>
        </ul>
      )}
    </NavContainer>
  )
}

export default NavItems
