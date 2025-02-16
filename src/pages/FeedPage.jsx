import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore'
import { db, auth } from '../services/firebase'
import {
  getCollectionsByUser,
  addToWishlist,
  removeFromWishlist,
  addToMyAlbums
} from '../services/api'
import { useAlbums } from '../context/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'

const FeedPage = () => {
  const { feedAlbums, fetchFeedAlbums } = useAlbums()
  const [user] = useAuthState(auth)
  const [collections, setCollections] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [currentUser] = useAuthState(auth)

  // Escuchar en tiempo real a quién sigue el usuario
  useEffect(() => {
    if (!currentUser?.uid) return

    const qFollowing = query(
      collection(db, 'follows'),
      where('followerId', '==', currentUser.uid)
    )

    const unsubscribeFollowing = onSnapshot(qFollowing, snapshot => {
      const followingData = snapshot.docs.map(doc => ({
        id: doc.data().followingId
      }))
      setFollowing(followingData)
    })

    return () => unsubscribeFollowing()
  }, [currentUser])

  // Obtener y actualizar los álbumes y colecciones de los usuarios seguidos
  useEffect(() => {
    const fetchFeedData = async () => {
      if (following.length === 0) {
        setCollections([])
        setLoadingCollections(false)
        return
      }

      const followingIds = following.map(f => f.id)

      // Obtener los álbumes del feed
      await fetchFeedAlbums(followingIds)

      const collectionsPromises = followingIds.map(userId =>
        getCollectionsByUser(userId)
      )

      const collectionsData = (await Promise.all(collectionsPromises)).flat()

      console.log('📚 Colecciones obtenidas en FeedPage:', collectionsData)

      setCollections(collectionsData)
      setLoadingCollections(false)

      // Marcar colecciones como vistas
      collectionsData.forEach(async collectionItem => {
        if (collectionItem?.id) {
          const viewedBy = Array.isArray(collectionItem.viewedBy)
            ? collectionItem.viewedBy
            : []
          if (!viewedBy.includes(currentUser?.uid)) {
            try {
              const collectionRef = doc(
                db,
                'collections',
                String(collectionItem.id)
              )
              await updateDoc(collectionRef, {
                viewedBy: [...viewedBy, currentUser.uid]
              })
            } catch (error) {
              console.error(
                `🚨 Error al marcar colección ${collectionItem.id} como vista:`,
                error
              )
            }
          }
        }
      })

      localStorage.setItem('feedVisited', 'true')
    }

    fetchFeedData()
  }, [following, currentUser, fetchFeedAlbums])

  // Funciones para la wishlist
  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(user.uid, album)
      console.log('Álbum añadido a wishlist')
      // Aquí podrías actualizar el estado local o el contexto, según lo necesites
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(user.uid, albumId)
      console.log('Álbum eliminado de wishlist')
      // Aquí podrías actualizar el estado local o el contexto, según lo necesites
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  // En ExplorePage.jsx, suponiendo que 'albums' es el estado de la lista de álbumes
  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(user.uid, album)
      console.log('✅ Álbum añadido a mis albums con éxito.')
      // Eliminamos el setAlbums manual, dejando que el onSnapshot del contexto actualice la lista.
    } catch (error) {
      console.error('⚠️ Error añadiendo álbum:', error)
    }
  }

  return (
    <div>
      <h1>Feed</h1>
      <h2>Álbums</h2>
      {feedAlbums.length > 0 ? (
        <AlbumsList
          albums={feedAlbums}
          showCollectedBy={false}
          showWishlistButton={true}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddToMyAlbums={handleAddToMyAlbums}
        />
      ) : (
        <p>No hay álbumes disponibles.</p>
      )}

      <h2>Colecciones</h2>
      {loadingCollections ? (
        <p>Cargando colecciones...</p>
      ) : collections.length > 0 ? (
        <ListCollections collections={collections} />
      ) : (
        <p>No hay colecciones disponibles.</p>
      )}
    </div>
  )
}

export default FeedPage
