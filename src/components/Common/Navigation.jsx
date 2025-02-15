import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut } from '../../services/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore'
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
  const [wishlistCount, setWishlistCount] = useState(0)
  const [newContent, setNewContent] = useState(false)

  useEffect(() => {
    if (!user?.uid) return // 🛑 No ejecutar si no hay usuario autenticado

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

    // 🔍 Verificar nuevos contenidos
    const checkNewContent = async () => {
      try {
        const followingSnapshot = await getDocs(
          query(collection(db, 'follows'), where('followerId', '==', user.uid))
        )
        const followingIds = followingSnapshot.docs.map(
          doc => doc.data().followingId
        )

        if (followingIds.length === 0) {
          setNewContent(false)
          return
        }

        // 🛠 Obtener nuevos álbumes y colecciones en una sola operación
        const [albumsSnapshot, collectionsSnapshot] = await Promise.all([
          getDocs(
            query(
              collection(db, 'albums'),
              where('userIds', 'array-contains-any', followingIds)
            )
          ),
          getDocs(
            query(
              collection(db, 'collections'),
              where('userId', 'in', followingIds)
            )
          )
        ])

        const newAlbums = albumsSnapshot.docs.some(
          doc => !doc.data().viewedBy?.includes(user.uid)
        )
        const newCollections = collectionsSnapshot.docs.some(
          doc => !doc.data().viewedBy?.includes(user.uid)
        )

        setNewContent(newAlbums || newCollections)
      } catch (error) {
        console.error('⚠️ Error verificando nuevos contenidos:', error.message)
      }
    }

    checkNewContent()

    return () => {
      console.log('♻️ Limpiando suscripciones de Firestore...')
      unsubscribes.forEach(unsub => unsub())
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
            <Link to="/feed">Feed {newContent && '¡Nuevos!'}</Link>
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
            <Link to="/wishlist">
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
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
