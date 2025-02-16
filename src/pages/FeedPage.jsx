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
  getAlbumsByUser,
  getCollectionsByUser,
  addToWishlist,
  removeFromWishlist
} from '../services/api'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'

const FeedPage = () => {
  const [albums, setAlbums] = useState([])
  const [collections, setCollections] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [currentUser] = useAuthState(auth)

  // Escuchamos a quién sigue el usuario
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

  // Obtenemos los álbumes y colecciones de los usuarios seguidos
  useEffect(() => {
    const fetchFeedData = async () => {
      if (following.length === 0) {
        setAlbums([])
        setCollections([])
        setLoadingCollections(false)
        return
      }

      const followingIds = following.map(f => f.id)

      const albumsPromises = followingIds.map(userId => getAlbumsByUser(userId))
      const collectionsPromises = followingIds.map(userId =>
        getCollectionsByUser(userId)
      )

      const albumsData = (await Promise.all(albumsPromises)).flat()
      const collectionsData = (await Promise.all(collectionsPromises)).flat()

      console.log('📚 Colecciones obtenidas en FeedPage:', collectionsData)

      setAlbums(albumsData)
      setCollections(collectionsData)
      setLoadingCollections(false)

      // Marcar álbumes como vistos en Firestore
      albumsData.forEach(async album => {
        if (album?.id) {
          const viewedBy = Array.isArray(album.viewedBy) ? album.viewedBy : []
          if (!viewedBy.includes(currentUser?.uid)) {
            try {
              const albumRef = doc(db, 'albums', String(album.id))
              await updateDoc(albumRef, {
                viewedBy: [...viewedBy, currentUser.uid]
              })
            } catch (error) {
              console.error(
                `🚨 Error al marcar álbum ${album.id} como visto:`,
                error
              )
            }
          }
        }
      })

      // Marcar colecciones como vistas en Firestore
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
  }, [following, currentUser])

  // Funciones para la wishlist
  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
      console.log('Álbum añadido a wishlist')
      // Puedes actualizar algún estado si lo deseas
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
      console.log('Álbum eliminado de wishlist')
      // Puedes actualizar algún estado si lo deseas
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  return (
    <div>
      <h1>Feed</h1>
      <h2>Álbums</h2>
      {albums.length > 0 ? (
        <AlbumsList
          albums={albums}
          showWishlistButton={true} // Se muestran los botones de wishlist
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
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
