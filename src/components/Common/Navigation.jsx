import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut } from '../../services/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import styled from 'styled-components'
import { FaBars, FaTimes } from 'react-icons/fa'

// 🔹 Contenedor del Navbar
const NavContainer = styled.nav`
  background-color: #333;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

// 🔹 Botón de menú hamburguesa (solo en móviles)
const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`

// 🔹 Menú de navegación
const NavMenu = styled.ul`
  list-style: none;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0;
  margin: 0;
  transition: all 0.3s ease-in-out;

  @media (max-width: 768px) {
    flex-direction: column;
    position: absolute;
    top: 50px;
    left: 0;
    width: 100%;
    background-color: #222;
    padding: 15px 0;
    transform: ${({ open }) => (open ? 'translateY(0)' : 'translateY(-300px)')};
    opacity: ${({ open }) => (open ? '1' : '0')};
    pointer-events: ${({ open }) => (open ? 'auto' : 'none')};
  }
`

// 🔹 Estilo de cada elemento de la lista
const NavItem = styled.li`
  margin: 0 10px;

  @media (max-width: 768px) {
    margin: 10px 0;
  }
`

// 🔹 Enlaces de navegación
const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 16px;

  &:hover {
    text-decoration: underline;
  }
`

// 🔹 Botón de cierre de sesión
const LogoutButton = styled.button`
  color: white;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    text-decoration: underline;
  }
`

const Navigation = () => {
  const [user] = useAuthState(auth)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [albumsCount, setAlbumsCount] = useState(0)
  const [collectionsCount, setCollectionsCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [newContent, setNewContent] = useState(
    localStorage.getItem('newContent') === 'true'
  )
  const location = useLocation()

  useEffect(() => {
    if (!user?.uid) return

    console.log('🔄 Cargando datos de navegación para el usuario:', user.uid)

    const unsubscribes = []

    const queries = [
      {
        ref: query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.uid),
          where('read', '==', false)
        ),
        setState: setUnreadCount
      },
      {
        ref: query(
          collection(db, 'follows'),
          where('followingId', '==', user.uid)
        ),
        setState: setFollowersCount
      },
      {
        ref: query(
          collection(db, 'follows'),
          where('followerId', '==', user.uid)
        ),
        setState: setFollowingCount
      },
      {
        ref: query(
          collection(db, 'albums'),
          where('userIds', 'array-contains', user.uid)
        ),
        setState: setAlbumsCount
      },
      {
        ref: query(
          collection(db, 'collections'),
          where('userId', '==', user.uid)
        ),
        setState: setCollectionsCount
      },
      {
        ref: query(collection(db, 'wishlist'), where('userId', '==', user.uid)),
        setState: setWishlistCount
      }
    ]

    queries.forEach(({ ref, setState }) => {
      const unsubscribe = onSnapshot(
        ref,
        snapshot => {
          setState(snapshot.size)
        },
        error => {
          console.error(`⚠️ Error en Firestore (${ref.path}):`, error.message)
        }
      )
      unsubscribes.push(unsubscribe)
    })

    // Escuchar cambios en los álbumes y colecciones de los usuarios seguidos
    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', user.uid)
    )

    const unsubscribeFollowing = onSnapshot(followingQuery, snapshot => {
      const followingIds = snapshot.docs.map(doc => doc.data().followingId)

      if (followingIds.length > 0) {
        const albumsQuery = query(
          collection(db, 'albums'),
          where('userIds', 'array-contains-any', followingIds)
        )

        const collectionsQuery = query(
          collection(db, 'collections'),
          where('userId', 'in', followingIds)
        )

        const unsubscribeAlbums = onSnapshot(albumsQuery, snapshot => {
          if (!snapshot.empty) {
            setNewContent(true)
            localStorage.setItem('newContent', 'true')
          }
        })

        const unsubscribeCollections = onSnapshot(
          collectionsQuery,
          snapshot => {
            if (!snapshot.empty) {
              setNewContent(true)
              localStorage.setItem('newContent', 'true')
            }
          }
        )

        unsubscribes.push(unsubscribeAlbums, unsubscribeCollections)
      }
    })

    unsubscribes.push(unsubscribeFollowing)

    return () => {
      console.log('♻️ Limpiando suscripciones de Firestore...')
      unsubscribes.forEach(unsub => unsub())
    }
  }, [user])

  // Desaparecer el mensaje "¡Nuevos!" al visitar el feed
  useEffect(() => {
    if (location.pathname === '/feed') {
      localStorage.setItem('newContent', 'false')
      setNewContent(false)
    }
  }, [location.pathname])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <NavContainer>
      {user && (
        <>
          {/* Botón de menú hamburguesa */}
          <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </MenuButton>

          <NavMenu open={menuOpen}>
            <NavItem>
              <NavLink to="/">Explorar</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/feed">Feed {newContent && '¡Nuevos!'}</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/albums">
                Albums {albumsCount > 0 && `(${albumsCount})`}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/collections">
                Colecciones {collectionsCount > 0 && `(${collectionsCount})`}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/messages">
                Mensajes {unreadCount > 0 && `(${unreadCount})`}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/followers">
                Seguidores {followersCount > 0 && `(${followersCount})`}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/following">
                Siguiendo {followingCount > 0 && `(${followingCount})`}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/wishlist">
                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/profile">Perfil</NavLink>
            </NavItem>
            <NavItem>
              <LogoutButton onClick={handleSignOut}>Cerrar sesión</LogoutButton>
            </NavItem>
          </NavMenu>
        </>
      )}
    </NavContainer>
  )
}

export default Navigation
