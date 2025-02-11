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
  orderBy
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

// CREATE MESSAGE
export const addMessage = async (conversationId, senderId, text) => {
  // Verificar si la conversación existe
  const conversationDoc = await getDoc(
    doc(db, conversationsCollectionName, conversationId)
  )
  let conversationIdToUse = conversationId

  if (!conversationDoc.exists()) {
    // Crear una nueva conversación si no existe
    const participants = [senderId, conversationId] // Asumiendo que conversationId es el ID del receptor
    conversationIdToUse = await createConversation(participants)
  }

  const colRef = collection(db, messagesCollectionName)
  const data = await addDoc(colRef, {
    conversationId: conversationIdToUse,
    senderId,
    text,
    timestamp: new Date()
  })

  // Update the conversation with the last message and timestamp
  await updateConversation(conversationIdToUse, {
    lastMessage: text,
    lastMessageTimestamp: new Date(),
    read: senderId === auth.currentUser.uid // Mark the conversation as read if the sender is the current user
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
  } else {
    console.error('No such conversation!')
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

// CREATE ALBUM
export const createAlbum = async obj => {
  const colRef = collection(db, albumsCollectionName)
  const data = await addDoc(colRef, obj)
  return data.id
}

// UPDATE ALBUM
export const updateAlbum = async (id, obj) => {
  const docRef = doc(db, albumsCollectionName, id)
  await updateDoc(docRef, obj)
}

// DELETE ALBUM
export const deleteAlbum = async id => {
  const docRef = doc(db, albumsCollectionName, id)
  await deleteDoc(docRef)
}

// READ ALBUMS
export const getAlbums = async () => {
  const colRef = collection(db, albumsCollectionName)
  const result = await getDocs(query(colRef))
  return getArrayFromCollection(result)
}

// READ ALBUMS BY USER
export const getAlbumsByUser = async userId => {
  const colRef = collection(db, albumsCollectionName)
  const result = await getDocs(
    query(colRef, where('userIds', 'array-contains', userId))
  )
  return getArrayFromCollection(result)
}

export const getAlbumById = async id => {
  const docRef = doc(db, albumsCollectionName, id)
  const result = await getDoc(docRef)
  return result.data()
}

// CREATE COLLECTION
export const createCollection = async obj => {
  const colRef = collection(db, collectionsCollectionName)
  const data = await addDoc(colRef, obj)
  return data.id
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

// READ COLLECTIONS
export const getCollections = async () => {
  const colRef = collection(db, collectionsCollectionName)
  const result = await getDocs(query(colRef))
  return getArrayFromCollection(result)
}

// READ COLLECTIONS BY USER
export const getCollectionsByUser = async userId => {
  const colRef = collection(db, collectionsCollectionName)
  const result = await getDocs(query(colRef, where('userId', '==', userId)))
  return getArrayFromCollection(result)
}

// READ COLLECTION BY ID
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
export const addToWishlist = async (userId, album) => {
  console.log('📡 Enviando álbum a Firebase:', album)

  const colRef = collection(db, wishlistCollectionName)
  try {
    const docRef = await addDoc(colRef, {
      userId,
      albumId: album.id,
      albumName: album.name,
      albumArtist: album.artist,
      albumYear: album.year,
      albumGenre: album.genre,
      albumLabel: album.label,
      albumImage: album.image,
      addedAt: new Date()
    })
    console.log('✅ Álbum añadido a Firebase con ID:', docRef.id)
  } catch (error) {
    console.error('❌ Error añadiendo a Firebase:', error)
  }
}

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (userId, albumId) => {
  const colRef = collection(db, wishlistCollectionName)
  const q = query(
    colRef,
    where('userId', '==', userId),
    where('albumId', '==', albumId)
  )
  const result = await getDocs(q)
  result.forEach(async doc => {
    await deleteDoc(doc.ref)
  })
}

// GET WISHLIST
export const getWishlist = async userId => {
  const colRef = collection(db, wishlistCollectionName)
  const result = await getDocs(query(colRef, where('userId', '==', userId)))

  const wishlistData = result.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  console.log('📥 Wishlist obtenida de Firebase:', wishlistData)

  return wishlistData
}
