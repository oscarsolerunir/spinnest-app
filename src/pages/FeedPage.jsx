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
import { getAlbumsByUser, getCollectionsByUser } from '../services/api'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'

const FeedPage = () => {
  const [albums, setAlbums] = useState([])
  const [collections, setCollections] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingCollections, setLoadingCollections] = useState(true) // Estado para mostrar carga
  const [currentUser] = useAuthState(auth)

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

  return (
    <div>
      <h1>Feed</h1>
      <h2>Álbums</h2>
      {albums.length > 0 ? (
        <AlbumsList albums={albums} />
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
