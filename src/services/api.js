import {
  db,
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  setDoc
} from './firebase'
import { auth } from './firebase'

const albumsCollectionName = 'albums'
const collectionsCollectionName = 'collections'
const conversationsCollectionName = 'conversations'
const messagesCollectionName = 'messages'
const followsCollectionName = 'follows'
const usersCollectionName = 'users'
const wishlistCollectionName = 'wishlist'

// Helper function to convert Firestore collection to array
const getArrayFromCollection = collection => {
  return collection.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// CREATE CONVERSATION
export const createConversation = async participants => {
  const colRef = collection(db, conversationsCollectionName)
  const data = await addDoc(colRef, {
    participants,
    read: false,
    lastMessage: '',
    lastMessageTimestamp: new Date()
  })
  return data.id
}

// UPDATE CONVERSATION
export const updateConversation = async (id, obj) => {
  const docRef = doc(db, conversationsCollectionName, id)
  await updateDoc(docRef, obj)
}

// ADD MESSAGE
export const addMessage = async (conversationId, senderId, text) => {
  const conversationDoc = await getDoc(
    doc(db, conversationsCollectionName, conversationId)
  )
  let conversationIdToUse = conversationId

  if (!conversationDoc.exists()) {
    const participants = [senderId, conversationId]
    conversationIdToUse = await createConversation(participants)
  }

  const colRef = collection(db, messagesCollectionName)
  const data = await addDoc(colRef, {
    conversationId: conversationIdToUse,
    senderId,
    text,
    timestamp: new Date()
  })

  await updateConversation(conversationIdToUse, {
    lastMessage: text,
    lastMessageTimestamp: new Date(),
    read: senderId === auth.currentUser.uid
  })

  return data.id
}

// MARK CONVERSATION AS READ
export const markConversationAsRead = async conversationId => {
  const docRef = doc(db, conversationsCollectionName, conversationId)
  const docSnapshot = await getDoc(docRef)
  if (docSnapshot.exists()) {
    await updateDoc(docRef, {
      read: true
    })
  }
}

// GET CONVERSATIONS BY USER
export const getConversationsByUser = async userId => {
  const colRef = collection(db, conversationsCollectionName)
  const result = await getDocs(
    query(colRef, where('participants', 'array-contains', userId))
  )
  return getArrayFromCollection(result)
}

// GET MESSAGES BY CONVERSATION
export const getMessagesByConversation = async conversationId => {
  const colRef = collection(db, messagesCollectionName)
  const result = await getDocs(
    query(
      colRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp')
    )
  )
  return getArrayFromCollection(result)
}

// ADD TO MY ALBUMS
export const addToMyAlbums = async (userId, album, updateState) => {
  try {
    if (!userId || !album || !album.id) {
      return
    }

    const albumRef = doc(db, 'albums', String(album.id))
    const albumDoc = await getDoc(albumRef)

    const userDoc = await getDoc(doc(db, 'users', userId))
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

    if (albumDoc.exists()) {
      const existingData = albumDoc.data()
      const userIds = existingData.userIds || []
      const userNames = existingData.userNames || []

      if (!userIds.includes(userId)) {
        await updateDoc(albumRef, {
          userIds: [...userIds, userId],
          userNames: [...userNames, userName]
        })
      }
    } else {
      const completeAlbumData = {
        id: album.id,
        name: album.name || 'Desconocido',
        artist: album.artist || 'Desconocido',
        year: album.year || 'Desconocido',
        genre: album.genre || 'Desconocido',
        label: album.label || 'Desconocido',
        country: album.country || 'Desconocido',
        released: album.released || 'Desconocido',
        notes: album.notes || 'Sin notas',
        formats: album.formats || [],
        lowest_price: album.lowest_price || 0,
        tracklist: album.tracklist || [],
        styles: album.styles || [],
        rating: album.rating || 0,
        rating_count: album.rating_count || 0,
        credits: album.credits || 'No disponible',
        discogs_url: album.discogs_url || '',
        videos: album.videos || [],
        image: album.image || '',
        all_images: album.all_images || [],
        userIds: [userId],
        userNames: [userName],
        addedAt: new Date().toISOString(),
        viewedBy: []
      }

      await setDoc(albumRef, completeAlbumData, { merge: true })
    }

    if (updateState) updateState(true)

    try {
      await removeFromWishlist(userId, album.id)
    } catch (error) {
      console.error('Error removiendo álbum de wishlist:', error)
    }
  } catch (error) {
    console.error('Error añadiendo álbum a mis albums:', error)
  }
}

// REMOVE FROM MY ALBUMS
export const removeFromMyAlbums = async (userId, albumId, updateState) => {
  try {
    const albumIdStr = String(albumId)
    const albumRef = doc(db, albumsCollectionName, albumIdStr)
    const albumDoc = await getDoc(albumRef)

    if (!albumDoc.exists()) {
      return
    }

    const albumData = albumDoc.data()
    const userIds = Array.isArray(albumData.userIds) ? albumData.userIds : []
    const userNames = Array.isArray(albumData.userNames)
      ? albumData.userNames
      : []

    if (!userIds.includes(userId)) {
      return
    }

    const updatedUserIds = userIds.filter(id => id !== userId)
    const updatedUserNames = userNames.filter(
      (_, i) => i !== userIds.indexOf(userId)
    )

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef)
    } else {
      await updateDoc(albumRef, {
        userIds: updatedUserIds,
        userNames: updatedUserNames
      })
    }

    if (updateState) updateState(albumIdStr)
  } catch (error) {
    console.error('Error eliminando álbum de mis albums:', error)
  }
}

// CREATE ALBUM
export const createAlbum = async album => {
  try {
    const albumRef = doc(db, albumsCollectionName, String(album.id))
    await setDoc(albumRef, album)
  } catch (error) {
    console.error('Error guardando álbum:', error)
    throw error
  }
}

// UPDATE ALBUM
export const updateAlbum = async (albumId, updates) => {
  try {
    const albumRef = doc(db, albumsCollectionName, String(albumId))
    await updateDoc(albumRef, updates)
  } catch (error) {
    console.error('Error actualizando álbum:', error)
    throw error
  }
}

// DELETE ALBUM
export const deleteAlbum = async (albumId, userId) => {
  const albumRef = doc(db, albumsCollectionName, albumId)

  try {
    const albumSnap = await getDoc(albumRef)

    if (!albumSnap.exists()) {
      return
    }

    const albumData = albumSnap.data()
    const updatedUserIds = albumData.userIds.filter(id => id !== userId)

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef)
    } else {
      await updateDoc(albumRef, { userIds: updatedUserIds })
    }
  } catch (error) {
    console.error('Error al eliminar el álbum:', error)
  }
}

// DELETE ALBUM BY ID
export const deleteAlbumById = async (albumId, userId) => {
  const albumRef = doc(db, albumsCollectionName, albumId)

  try {
    const albumSnap = await getDoc(albumRef)

    if (!albumSnap.exists()) {
      return
    }

    const albumData = albumSnap.data()
    const updatedUserIds = albumData.userIds.filter(id => id !== userId)

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef)
    } else {
      await updateDoc(albumRef, { userIds: updatedUserIds })
    }
  } catch (error) {
    console.error('Error al eliminar el álbum:', error)
  }
}

// GET ALBUMS
export const getAlbums = async () => {
  const colRef = collection(db, albumsCollectionName)
  const result = await getDocs(query(colRef))
  return getArrayFromCollection(result)
}

// GET ALBUMS BY USER
export const getAlbumsByUser = async userId => {
  if (!userId) {
    return []
  }

  const colRef = collection(db, albumsCollectionName)
  const result = await getDocs(
    query(colRef, where('userIds', 'array-contains', userId))
  )
  return getArrayFromCollection(result)
}

// GET ALBUM BY ID
export const getAlbumById = async id => {
  if (!id) {
    return null
  }

  try {
    const albumRef = doc(db, 'albums', String(id))
    const albumSnap = await getDoc(albumRef)

    if (!albumSnap.exists()) {
      return null
    }

    return albumSnap.data()
  } catch (error) {
    console.error('Error obteniendo álbum de Firestore:', error)
    return null
  }
}

// CREATE COLLECTION
export const createCollection = async obj => {
  const colRef = collection(db, collectionsCollectionName)
  const docRef = await addDoc(colRef, obj)
  return docRef.id
}

// UPDATE COLLECTION
export const updateCollection = async (id, obj) => {
  const docRef = doc(db, collectionsCollectionName, id)
  await updateDoc(docRef, obj)
}

// DELETE COLLECTION
export const deleteCollection = async id => {
  const docRef = doc(db, collectionsCollectionName, id)
  await deleteDoc(docRef)
}

// GET COLLECTIONS
export const getCollections = async () => {
  const colRef = collection(db, collectionsCollectionName)
  const result = await getDocs(query(colRef))
  return getArrayFromCollection(result)
}

// GET COLLECTIONS BY USER
export const getCollectionsByUser = async userId => {
  if (!userId) {
    return []
  }

  try {
    const colRef = collection(db, 'collections')
    const q = query(colRef, where('userId', '==', userId))
    const result = await getDocs(q)

    if (result.empty) {
      return []
    }

    return result.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error(`Error obteniendo colecciones de Firebase:`, error)
    return []
  }
}

// GET COLLECTION BY ID
export const getCollectionById = async id => {
  const docRef = doc(db, collectionsCollectionName, id)
  const result = await getDoc(docRef)
  if (result.exists()) {
    return { id: result.id, ...result.data() }
  } else {
    throw new Error('No se ha encontrado la colección')
  }
}

// FOLLOW USER
export const followUser = async (followerId, followingId) => {
  const colRef = collection(db, followsCollectionName)
  const data = await addDoc(colRef, { followerId, followingId })
  return data.id
}

// UNFOLLOW USER
export const unfollowUser = async (followerId, followingId) => {
  const colRef = collection(db, followsCollectionName)
  const q = query(
    colRef,
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  )
  const result = await getDocs(q)
  result.forEach(async doc => {
    await deleteDoc(doc.ref)
  })
}

// GET FOLLOWING USERS
export const getFollowingUsers = async userId => {
  const colRef = collection(db, followsCollectionName)
  const q = query(colRef, where('followerId', '==', userId))
  const result = await getDocs(q)
  return getArrayFromCollection(result)
}

// GET FOLLOWERS
export const getFollowers = async userId => {
  const colRef = collection(db, followsCollectionName)
  const q = query(colRef, where('followingId', '==', userId))
  const result = await getDocs(q)
  return getArrayFromCollection(result)
}

// GET USERS
export const getUsers = async () => {
  const colRef = collection(db, usersCollectionName)
  const result = await getDocs(query(colRef))
  return getArrayFromCollection(result)
}

// GET USER BY ID
export const getUserById = async userId => {
  const docRef = doc(db, usersCollectionName, userId)
  const result = await getDoc(docRef)
  if (result.exists()) {
    return { id: result.id, ...result.data() }
  } else {
    throw new Error('No se ha encontrado el usuario')
  }
}

// ADD TO WISHLIST
export const addToWishlist = async (userId, album, updateState) => {
  try {
    if (!userId || !album || !album.id) {
      return
    }

    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

    const wishlistItemData = {
      albumId: album.id,
      albumName: album.name,
      albumArtist: album.artist,
      albumYear: album.year,
      albumGenre: album.genre,
      albumLabel: album.label,
      albumImage: album.image,
      userId,
      userName,
      addedAt: new Date().toISOString()
    }

    await addDoc(collection(db, wishlistCollectionName), wishlistItemData)
    if (updateState) updateState(true)
  } catch (error) {
    console.error('Error añadiendo a wishlist:', error)
  }
}

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (userId, albumId) => {
  try {
    const colRef = collection(db, 'wishlist')
    const q = query(
      colRef,
      where('userId', '==', userId),
      where('albumId', '==', albumId)
    )
    const snapshot = await getDocs(q)
    snapshot.forEach(async docSnap => {
      await deleteDoc(docSnap.ref)
    })
  } catch (error) {
    console.error('Error eliminando de wishlist:', error)
    throw error
  }
}

// GET WISHLIST
export const getWishlist = async userId => {
  try {
    const colRef = collection(db, wishlistCollectionName)
    const q = query(colRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error obteniendo wishlist:', error)
    return []
  }
}
