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
  removeFromWishlist,
  addToMyAlbums,
  removeFromMyAlbums
} from '../services/api'
import AlbumsList from '../components/Albums/AlbumsList'
import ListCollections from '../components/Collections/ListCollections'

const FeedPage = () => {
  const [albums, setAlbums] = useState([]) // Ahora es un estado local
  const [collections, setCollections] = useState([])
  const [following, setFollowing] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser?.uid) {
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

      return () => {
        unsubscribeFollowing()
      }
    }
  }, [currentUser])

  useEffect(() => {
    const fetchFeedData = async () => {
      if (following.length > 0) {
        const followingIds = following.map(f => f.id)

        const albumsPromises = followingIds.map(async userId => {
          return await getAlbumsByUser(userId)
        })

        const collectionsPromises = followingIds.map(async userId => {
          return await getCollectionsByUser(userId)
        })

        const albumsData = (await Promise.all(albumsPromises)).flat()
        const collectionsData = (await Promise.all(collectionsPromises)).flat()

        setAlbums(albumsData)
        setCollections(collectionsData)

        albumsData.forEach(async album => {
          if (!album.viewedBy?.includes(currentUser?.uid)) {
            const albumRef = doc(db, 'albums', album.id)
            await updateDoc(albumRef, {
              viewedBy: [...(album.viewedBy || []), currentUser.uid]
            })
          }
        })

        collectionsData.forEach(async collection => {
          if (!collection.viewedBy?.includes(currentUser?.uid)) {
            const collectionRef = doc(db, 'collections', collection.id)
            await updateDoc(collectionRef, {
              viewedBy: [...(collection.viewedBy || []), currentUser.uid]
            })
          }
        })
      } else {
        setAlbums([]) // Vaciar si no hay usuarios seguidos
        setCollections([])
      }
    }

    fetchFeedData()
  }, [following, currentUser])

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
      setWishlist(prevWishlist => [...prevWishlist, album])
    } catch (error) {
      console.error('Error adding album to wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(currentUser.uid, albumId)
      setWishlist(prevWishlist => prevWishlist.filter(a => a.id !== albumId))
    } catch (error) {
      console.error('Error removing album from wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(currentUser.uid, album)
      setAlbums(prevAlbums => [...prevAlbums, album])
    } catch (error) {
      console.error('Error adding album to my albums:', error)
    }
  }

  const handleRemoveFromMyAlbums = async albumId => {
    try {
      await removeFromMyAlbums(currentUser.uid, albumId)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== albumId))
    } catch (error) {
      console.error('Error removing album from my albums:', error)
    }
  }

  return (
    <div>
      <h1>Feed</h1>
      <h2>Álbums</h2>
      {albums.length > 0 ? (
        <AlbumsList
          albums={albums}
          handleAddToWishlist={handleAddToWishlist}
          handleRemoveFromWishlist={handleRemoveFromWishlist}
          handleAddToMyAlbums={handleAddToMyAlbums}
          handleRemoveFromMyAlbums={handleRemoveFromMyAlbums}
        />
      ) : (
        <p>No hay álbumes disponibles.</p>
      )}

      <h2>Colecciones</h2>
      {collections.length > 0 ? (
        <ListCollections collections={collections} />
      ) : (
        <p>No hay colecciones disponibles.</p>
      )}
    </div>
  )
}

export default FeedPage
