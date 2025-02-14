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

// ADD TO MY ALBUMS
export const addToMyAlbums = async (userId, album) => {
  try {
    if (!userId || !album || !album.id) {
      console.error('❌ Error: userId o album.id no son válidos:', {
        userId,
        album
      })
      return
    }

    console.log('📀 addToMyAlbums ejecutándose con:', album)

    const albumRef = doc(db, 'albums', String(album.id))
    const albumDoc = await getDoc(albumRef)

    const userDoc = await getDoc(doc(db, 'users', userId))
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

    if (albumDoc.exists()) {
      console.log(
        '🔄 El álbum ya existe en Firestore, actualizando usuarios...'
      )
      const existingData = albumDoc.data()
      const userIds = existingData.userIds || []
      const userNames = existingData.userNames || []

      if (!userIds.includes(userId)) {
        await updateDoc(albumRef, {
          userIds: [...userIds, userId],
          userNames: [...userNames, userName]
        })
        console.log('✅ Álbum actualizado correctamente en Firestore.')
      } else {
        console.warn('⚠️ El usuario ya tenía este álbum en su colección.')
      }
    } else {
      console.log(`🆕 Creando nuevo álbum (${album.id}) en Firestore.`)
      await setDoc(albumRef, {
        ...album,
        artist: album.artist || 'Desconocido', // 🔹 Si `artist` es undefined, se asigna 'Desconocido'
        genre: album.genre || 'Desconocido',
        label: album.label || 'Desconocido',
        userIds: [userId],
        userNames: [userName],
        addedAt: new Date().toISOString()
      })
      console.log('✅ Álbum añadido correctamente a Firestore.')
    }
  } catch (error) {
    console.error('❌ Error añadiendo álbum a mis albums:', error)
  }
}

// REMOVE FROM MY ALBUMS
export const removeFromMyAlbums = async (userId, albumId) => {
  const albumRef = doc(db, albumsCollectionName, albumId)
  const albumDoc = await getDoc(albumRef)

  if (albumDoc.exists()) {
    const albumData = albumDoc.data()
    const userIds = albumData.userIds || []
    const userNames = albumData.userNames || []
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'
    const updatedUserIds = userIds.filter(id => id !== userId)
    const updatedUserNames = userNames.filter(name => name !== userName)

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef)
    } else {
      await updateDoc(albumRef, {
        userIds: updatedUserIds,
        userNames: updatedUserNames
      })
    }
  }
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
export const deleteAlbum = async (albumId, userId) => {
  const albumRef = doc(db, albumsCollectionName, albumId)

  try {
    const albumSnap = await getDoc(albumRef)

    if (!albumSnap.exists()) {
      console.error('El álbum no existe')
      return
    }

    const albumData = albumSnap.data()
    const updatedUserIds = albumData.userIds.filter(id => id !== userId)

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef) // Eliminar si no quedan usuarios
      console.log('Álbum eliminado de la base de datos')
    } else {
      await updateDoc(albumRef, { userIds: updatedUserIds }) // Actualizar lista de usuarios
      console.log('Álbum eliminado del usuario pero no de la base de datos')
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
      console.error('El álbum no existe')
      return
    }

    const albumData = albumSnap.data()
    const updatedUserIds = albumData.userIds.filter(id => id !== userId)

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef) // Eliminar si no quedan usuarios
      console.log('Álbum eliminado de la base de datos')
    } else {
      await updateDoc(albumRef, { userIds: updatedUserIds }) // Actualizar lista de usuarios
      console.log('Álbum eliminado del usuario pero no de la base de datos')
    }
  } catch (error) {
    console.error('Error al eliminar el álbum:', error)
  }
}

// GET ALBUMS
export const getAlbums = async () => {
  const colRef = collection(db, albumsCollectionName)
  const result = await getDocs(query(colRef))

  const albumsData = getArrayFromCollection(result)
  console.log('📀 Álbumes obtenidos de Firebase:', albumsData)

  return albumsData
}

// GET ALBUMS BY USER
export const getAlbumsByUser = async userId => {
  if (!userId) {
    console.error('❌ Error: usuario no autenticado')
    return []
  }

  const colRef = collection(db, albumsCollectionName)
  const result = await getDocs(
    query(colRef, where('userIds', 'array-contains', userId))
  )

  const userAlbumsData = getArrayFromCollection(result)
  console.log(
    `📀 Álbumes del usuario ${userId} obtenidos de Firebase:`,
    userAlbumsData
  )

  return userAlbumsData
}

// GET ALBUM BY ID
export const getAlbumById = async albumId => {
  const albumRef = doc(db, albumsCollectionName, albumId)
  const albumSnap = await getDoc(albumRef)

  if (!albumSnap.exists()) {
    throw new Error('Álbum no encontrado')
  }

  const albumData = albumSnap.data()

  // Obtener los nombres de los usuarios de la wishlist
  const wishlistRef = collection(db, wishlistCollectionName)
  const wishlistSnap = await getDocs(
    query(wishlistRef, where('id', '==', albumId))
  )

  const wishlistUserNames = wishlistSnap.docs.flatMap(
    doc => doc.data().userNames
  )

  return { ...albumData, wishlistUserNames }
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

// GET COLLECTIONS
export const getCollections = async () => {
  const colRef = collection(db, collectionsCollectionName)
  const result = await getDocs(query(colRef))

  const collectionsData = getArrayFromCollection(result)
  console.log('📚 Colecciones obtenidas de Firebase:', collectionsData)

  return collectionsData
}

// GET COLLECTIONS BY USER
export const getCollectionsByUser = async userId => {
  if (!userId) {
    userId = auth.currentUser?.uid
    if (!userId) {
      console.error('❌ Error: usuario no autenticado')
      return []
    }
  }

  console.log(`📡 Consultando colecciones en Firebase para usuario: ${userId}`)

  try {
    const colRef = collection(db, collectionsCollectionName)
    const result = await getDocs(query(colRef, where('userId', '==', userId)))

    const collectionsData = getArrayFromCollection(result)
    console.log(
      `📚 Colecciones del usuario ${userId} obtenidas de Firebase:`,
      collectionsData
    )

    return collectionsData
  } catch (error) {
    console.error(`❌ Error obteniendo colecciones de Firebase:`, error)
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
export const addToWishlist = async (userId, album) => {
  const albumRef = doc(db, albumsCollectionName, album.id)
  const albumDoc = await getDoc(albumRef)

  const userDoc = await getDoc(doc(db, 'users', userId))
  const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

  if (albumDoc.exists()) {
    const albumData = albumDoc.data()
    const isInWishlistOfUserIds = albumData.isInWishlistOfUserIds || []
    const isInWishlistOfUserNames = albumData.isInWishlistOfUserNames || []

    if (!isInWishlistOfUserIds.includes(userId)) {
      await updateDoc(albumRef, {
        isInWishlistOfUserIds: [...isInWishlistOfUserIds, userId],
        isInWishlistOfUserNames: [...isInWishlistOfUserNames, userName]
      })
    }
  } else {
    await addDoc(albumRef, {
      ...album,
      isInWishlistOfUserIds: [userId],
      isInWishlistOfUserNames: [userName],
      addedAt: new Date()
    })
  }
}

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (userId, albumId) => {
  const albumRef = doc(db, albumsCollectionName, albumId)
  const albumDoc = await getDoc(albumRef)

  if (albumDoc.exists()) {
    const albumData = albumDoc.data()
    const isInWishlistOfUserIds = albumData.isInWishlistOfUserIds || []
    const isInWishlistOfUserNames = albumData.isInWishlistOfUserNames || []
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'
    const updatedUserIds = isInWishlistOfUserIds.filter(id => id !== userId)
    const updatedUserNames = isInWishlistOfUserNames.filter(
      name => name !== userName
    )

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef)
    } else {
      await updateDoc(albumRef, {
        isInWishlistOfUserIds: updatedUserIds,
        isInWishlistOfUserNames: updatedUserNames
      })
    }
  }
}

// GET WISHLIST BY USER
export const getWishlist = async userId => {
  const colRef = collection(db, albumsCollectionName)
  const result = await getDocs(
    query(colRef, where('isInWishlistOfUserIds', 'array-contains', userId))
  )
  return getArrayFromCollection(result)
}
