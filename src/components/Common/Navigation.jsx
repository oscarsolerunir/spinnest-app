import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, signOut } from '../../services/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { FaBars, FaTimes } from 'react-icons/fa'

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
          console.error(`Error en Firestore (${ref.path}):`, error.message)
        }
      )
      unsubscribes.push(unsubscribe)
    })

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

        const lastFeedVisitStr = localStorage.getItem('lastFeedVisit')
        const lastFeedVisit = lastFeedVisitStr
          ? new Date(lastFeedVisitStr)
          : new Date(0)

        const unsubscribeAlbums = onSnapshot(albumsQuery, snapshot => {
          const newAlbums = snapshot.docs.filter(doc => {
            const data = doc.data()
            if (!data.addedAt) return false
            const addedAt = new Date(data.addedAt)
            return addedAt > lastFeedVisit
          })

          if (newAlbums.length > 0) {
            setNewContent(true)
            localStorage.setItem('newContent', 'true')
          }
        })

        const unsubscribeCollections = onSnapshot(
          collectionsQuery,
          snapshot => {
            const newCollections = snapshot.docs.filter(doc => {
              const data = doc.data()
              if (!data.createdAt) return false
              const createdAt = new Date(data.createdAt)
              return createdAt > lastFeedVisit
            })

            if (newCollections.length > 0) {
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
      unsubscribes.forEach(unsub => unsub())
    }
  }, [user])

  useEffect(() => {
    if (location.pathname === '/feed') {
      const now = new Date().toISOString()
      localStorage.setItem('lastFeedVisit', now)
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
    <nav className="pt-4 flex justify-between items-center">
      <button
        className="text-gray text-2xl md:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>
      <ul
        className={`${
          menuOpen ? 'flex' : 'hidden'
        } md:flex flex-col md:flex-row md:items-center w-full md:w-auto`}
      >
        <li className="m-2">
          <Link
            to="/"
            className={`${
              location.pathname === '/' ? 'text-primary' : 'text-gray'
            } no-underline ${location.pathname !== '/' && 'hover:text-white'}`}
          >
            Explorar
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/feed"
            className={`${
              location.pathname === '/feed' ? 'text-primary' : 'text-gray'
            } no-underline ${
              location.pathname !== '/feed' && 'hover:text-white'
            }`}
          >
            Feed {newContent && '¡Nuevos!'}
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/albums"
            className={`${
              location.pathname === '/albums' ? 'text-primary' : 'text-gray'
            } no-underline ${
              location.pathname !== '/albums' && 'hover:text-white'
            } flex items-center`}
          >
            Albums
            {albumsCount > 0 && (
              <span
                className={`ml-2 ${
                  location.pathname === '/albums'
                    ? 'bg-primary text-black'
                    : 'bg-darkgray text-white'
                } rounded-full px-2 py-1 text-xs`}
              >
                {albumsCount}
              </span>
            )}
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/collections"
            className={`${
              location.pathname === '/collections'
                ? 'text-primary'
                : 'text-gray'
            } no-underline ${
              location.pathname !== '/collections' && 'hover:text-white'
            } flex items-center`}
          >
            Colecciones
            {collectionsCount > 0 && (
              <span
                className={`ml-2 ${
                  location.pathname === '/collections'
                    ? 'bg-primary text-black'
                    : 'bg-darkgray text-white'
                } rounded-full px-2 py-1 text-xs`}
              >
                {collectionsCount}
              </span>
            )}
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/messages"
            className={`${
              location.pathname === '/messages' ? 'text-primary' : 'text-gray'
            } no-underline ${
              location.pathname !== '/messages' && 'hover:text-white'
            } flex items-center`}
          >
            Mensajes
            {unreadCount > 0 && (
              <span
                className={`ml-2 ${
                  location.pathname === '/messages'
                    ? 'bg-primary text-black'
                    : 'bg-darkgray text-white'
                } rounded-full px-2 py-1 text-xs`}
              >
                {unreadCount}
              </span>
            )}
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/followers"
            className={`${
              location.pathname === '/followers' ? 'text-primary' : 'text-gray'
            } no-underline ${
              location.pathname !== '/followers' && 'hover:text-white'
            } flex items-center`}
          >
            Seguidores
            {followersCount > 0 && (
              <span
                className={`ml-2 ${
                  location.pathname === '/followers'
                    ? 'bg-primary text-black'
                    : 'bg-darkgray text-white'
                } rounded-full px-2 py-1 text-xs`}
              >
                {followersCount}
              </span>
            )}
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/following"
            className={`${
              location.pathname === '/following' ? 'text-primary' : 'text-gray'
            } no-underline ${
              location.pathname !== '/following' && 'hover:text-white'
            } flex items-center`}
          >
            Siguiendo
            {followingCount > 0 && (
              <span
                className={`ml-2 ${
                  location.pathname === '/following'
                    ? 'bg-primary text-black'
                    : 'bg-darkgray text-white'
                } rounded-full px-2 py-1 text-xs`}
              >
                {followingCount}
              </span>
            )}
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/wishlist"
            className={`${
              location.pathname === '/wishlist' ? 'text-primary' : 'text-gray'
            } no-underline ${
              location.pathname !== '/wishlist' && 'hover:text-white'
            } flex items-center`}
          >
            Wishlist
            {wishlistCount > 0 && (
              <span
                className={`ml-2 ${
                  location.pathname === '/wishlist'
                    ? 'bg-primary text-black'
                    : 'bg-darkgray text-white'
                } rounded-full px-2 py-1 text-xs`}
              >
                {wishlistCount}
              </span>
            )}
          </Link>
        </li>
        <li className="m-2">
          <Link
            to="/profile"
            className={`${
              location.pathname === '/profile' ? 'text-primary' : 'text-gray'
            } no-underline ${
              location.pathname !== '/profile' && 'hover:text-white'
            }`}
          >
            Perfil
          </Link>
        </li>
        <li className="m-2">
          <button
            onClick={handleSignOut}
            className="text-gray no-underline hover:text-white"
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
