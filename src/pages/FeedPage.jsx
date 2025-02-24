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
import { useAlbums } from '../contexts/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import CollectionsList from '../components/Collections/CollectionsList'

const FeedPage = () => {
  const { feedAlbums, fetchFeedAlbums } = useAlbums()
  const [user] = useAuthState(auth)
  const [collections, setCollections] = useState([])
  const [following, setFollowing] = useState([])
  const [loadingCollections, setLoadingCollections] = useState(true)
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
        setCollections([])
        setLoadingCollections(false)
        return
      }

      const followingIds = following.map(f => f.id)

      await fetchFeedAlbums(followingIds)

      const collectionsPromises = followingIds.map(userId =>
        getCollectionsByUser(userId)
      )

      const collectionsData = (await Promise.all(collectionsPromises)).flat()

      setCollections(collectionsData)
      setLoadingCollections(false)

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
                `Error al marcar colección ${collectionItem.id} como vista:`,
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

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(user.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(user.uid, albumId)
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(user.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum:', error)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      <h2 className="text-xl font-semibold mb-2">Álbums</h2>
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

      <h2 className="text-xl font-semibold mb-2">Colecciones</h2>
      {loadingCollections ? (
        <p>Cargando colecciones...</p>
      ) : collections.length > 0 ? (
        <CollectionsList collections={collections} />
      ) : (
        <p>No hay colecciones disponibles.</p>
      )}
    </div>
  )
}

export default FeedPage
