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
import AlbumItem from '../components/Albums/AlbumItem'
import ListCollections from '../components/Collections/ListCollections'

const FeedPage = () => {
  const [albums, setAlbums] = useState([])
  const [collections, setCollections] = useState([])
  const [following, setFollowing] = useState([])
  const [wishlist] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const qFollowing = query(
        collection(db, 'follows'),
        where('followerId', '==', currentUser.uid)
      )
      const unsubscribeFollowing = onSnapshot(qFollowing, snapshot => {
        const followingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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
        const albumsPromises = following.map(async follow => {
          const userAlbums = await getAlbumsByUser(follow.followingId)
          return userAlbums
        })

        const collectionsPromises = following.map(async follow => {
          const userCollections = await getCollectionsByUser(follow.followingId)
          return userCollections
        })

        const albumsData = await Promise.all(albumsPromises)
        const collectionsData = await Promise.all(collectionsPromises)

        setAlbums(albumsData.flat())
        setCollections(collectionsData.flat())

        // Marcar el contenido como visto
        albumsData.flat().forEach(async album => {
          if (!album.viewedBy?.includes(currentUser.uid)) {
            const albumRef = doc(db, 'albums', album.id)
            await updateDoc(albumRef, {
              viewedBy: [...(album.viewedBy || []), currentUser.uid]
            })
          }
        })

        collectionsData.flat().forEach(async collection => {
          if (!collection.viewedBy?.includes(currentUser.uid)) {
            const collectionRef = doc(db, 'collections', collection.id)
            await updateDoc(collectionRef, {
              viewedBy: [...(collection.viewedBy || []), currentUser.uid]
            })
          }
        })
      }
    }

    fetchFeedData()
  }, [following, currentUser])

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(currentUser.uid, album)
      setAlbums(prevAlbums => [...prevAlbums, album])
    } catch (error) {
      console.error('Error adding album to wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async album => {
    try {
      await removeFromWishlist(currentUser.uid, album.id)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== album.id))
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

  const handleRemoveFromMyAlbums = async album => {
    try {
      await removeFromMyAlbums(currentUser.uid, album.id)
      setAlbums(prevAlbums => prevAlbums.filter(a => a.id !== album.id))
    } catch (error) {
      console.error('Error removing album from my albums:', error)
    }
  }

  return (
    <div>
      <h1>Feed</h1>
      <h2>Álbums</h2>
      {albums.length > 0 ? (
        <div>
          {albums.map(album => (
            <AlbumItem
              key={album.id}
              album={album}
              userId={currentUser?.uid}
              wishlist={wishlist}
              handleAddToWishlist={handleAddToWishlist}
              handleRemoveFromWishlist={handleRemoveFromWishlist}
              handleAddToMyAlbums={handleAddToMyAlbums}
              handleRemoveFromMyAlbums={handleRemoveFromMyAlbums}
            />
          ))}
        </div>
      ) : (
        <p>No hay álbums disponibles.</p>
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
