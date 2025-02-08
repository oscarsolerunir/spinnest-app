import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut } from '../../services/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
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
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [albumsCount, setAlbumsCount] = useState(0)
  const [collectionsCount, setCollectionsCount] = useState(0)

  useEffect(() => {
    if (user) {
      const qUnread = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid),
        where('read', '==', false)
      )

      const unsubscribeUnread = onSnapshot(qUnread, snapshot => {
        setUnreadCount(snapshot.size)
      })

      const qFollowers = query(
        collection(db, 'follows'),
        where('followingId', '==', user.uid)
      )

      const unsubscribeFollowers = onSnapshot(qFollowers, snapshot => {
        setFollowersCount(snapshot.size)
      })

      const qFollowing = query(
        collection(db, 'follows'),
        where('followerId', '==', user.uid)
      )

      const unsubscribeFollowing = onSnapshot(qFollowing, snapshot => {
        setFollowingCount(snapshot.size)
      })

      const qAlbums = query(
        collection(db, 'albums'),
        where('userId', '==', user.uid)
      )

      const unsubscribeAlbums = onSnapshot(qAlbums, snapshot => {
        setAlbumsCount(snapshot.size)
      })

      const qCollections = query(
        collection(db, 'collections'),
        where('userId', '==', user.uid)
      )

      const unsubscribeCollections = onSnapshot(qCollections, snapshot => {
        setCollectionsCount(snapshot.size)
      })

      return () => {
        unsubscribeUnread()
        unsubscribeFollowers()
        unsubscribeFollowing()
        unsubscribeAlbums()
        unsubscribeCollections()
      }
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
            <Link to="/">Explorar</Link>
          </li>
          <li>
            <Link to="/albums">
              Albums {albumsCount > 0 && `(${albumsCount})`}
            </Link>
          </li>
          <li>
            <Link to="/collections">
              Colecciones {collectionsCount > 0 && `(${collectionsCount})`}
            </Link>
          </li>
          <li>
            <Link to="/messages">
              Mensajes {unreadCount > 0 && `(${unreadCount})`}
            </Link>
          </li>
          <li>
            <Link to="/followers">
              Seguidores {followersCount > 0 && `(${followersCount})`}
            </Link>
          </li>
          <li>
            <Link to="/following">
              Siguiendo {followingCount > 0 && `(${followingCount})`}
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
