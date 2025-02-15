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
export const addToMyAlbums = async (userId, album, updateState) => {
  try {
    if (!userId || !album || !album.id) {
      console.error('❌ Error: userId o album.id no son válidos:', {
        userId,
        album
      })
      return
    }

    console.log('📀 Intentando añadir álbum a mis albums:', album)

    const albumRef = doc(db, 'albums', String(album.id))
    const albumDoc = await getDoc(albumRef)

    const userDoc = await getDoc(doc(db, 'users', userId))
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

    if (albumDoc.exists()) {
      console.log('🔄 Álbum ya existe en Firebase, actualizando usuarios...')
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
        viewedBy: [] // Inicializamos viewedBy como un array vacío
      }

      console.log('📀 Guardando en Firebase:', completeAlbumData)

      await setDoc(albumRef, completeAlbumData, { merge: true }) // 🔹 ¡Usar `merge: true` evita borrar datos existentes!

      console.log('✅ Álbum añadido correctamente a Firestore.')
    }

    if (updateState) updateState(true)
  } catch (error) {
    console.error('❌ Error añadiendo álbum a mis albums:', error)
  }
}

// REMOVE FROM MY ALBUMS
export const removeFromMyAlbums = async (userId, albumId, updateState) => {
  try {
    const albumIdStr = String(albumId) // ✅ Asegurar que el ID es string
    console.log(`🗑️ Eliminando álbum ID: ${albumIdStr} para usuario: ${userId}`)

    const albumRef = doc(db, albumsCollectionName, albumIdStr)
    const albumDoc = await getDoc(albumRef)

    if (!albumDoc.exists()) {
      console.error('❌ Error: El álbum no existe en Firestore.')
      return
    }

    const albumData = albumDoc.data()
    const userIds = Array.isArray(albumData.userIds) ? albumData.userIds : []
    const userNames = Array.isArray(albumData.userNames)
      ? albumData.userNames
      : []

    if (!userIds.includes(userId)) {
      console.warn('⚠️ El usuario no tiene este álbum en su colección.')
      return
    }

    const updatedUserIds = userIds.filter(id => id !== userId)
    const updatedUserNames = userNames.filter(
      (_, i) => i !== userIds.indexOf(userId)
    )

    if (updatedUserIds.length === 0) {
      await deleteDoc(albumRef)
      console.log('🗑️ Álbum eliminado completamente de Firestore.')
    } else {
      await updateDoc(albumRef, {
        userIds: updatedUserIds,
        userNames: updatedUserNames
      })
      console.log('✅ Álbum eliminado de la colección del usuario.')
    }

    if (updateState) updateState(albumIdStr) // 🔄 Llamar a la función para actualizar la UI
  } catch (error) {
    console.error('❌ Error eliminando álbum de mis albums:', error)
  }
}

// CREATE ALBUM
export const createAlbum = async album => {
  try {
    const albumRef = doc(db, albumsCollectionName, String(album.id))

    // 🔹 Verificar que el objeto tiene todos los datos antes de guardarlo
    console.log('📀 Guardando en Firebase:', album)

    await setDoc(albumRef, album)

    console.log('✅ Álbum guardado en Firebase correctamente')
  } catch (error) {
    console.error('❌ Error guardando álbum:', error)
    throw error
  }
}

// UPDATE ALBUM
export const updateAlbum = async (albumId, updates) => {
  try {
    const albumRef = doc(db, albumsCollectionName, String(albumId))
    await updateDoc(albumRef, updates)
    console.log('✅ Álbum actualizado en Firebase:', updates)
  } catch (error) {
    console.error('❌ Error actualizando álbum:', error)
    throw error
  }
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
export const getAlbumById = async id => {
  if (!id) {
    console.error('❌ Error: ID no válido para getAlbumById')
    return null
  }

  try {
    const albumRef = doc(db, 'albums', String(id))
    const albumSnap = await getDoc(albumRef)

    if (!albumSnap.exists()) {
      console.warn(`⚠️ Álbum con ID ${id} no encontrado en Firestore`)
      return null
    }

    return albumSnap.data()
  } catch (error) {
    console.error('❌ Error obteniendo álbum de Firestore:', error)
    return null
  }
}

// export const getAlbumById = async albumId => {
//   const albumRef = doc(db, albumsCollectionName, albumId)
//   const albumSnap = await getDoc(albumRef)

//   if (!albumSnap.exists()) {
//     throw new Error('Álbum no encontrado')
//   }

//   const albumData = albumSnap.data()

//   console.log('📀 Datos obtenidos de Firebase:', albumData)

//   // Obtener los nombres de los usuarios de la wishlist
//   const wishlistRef = collection(db, wishlistCollectionName)
//   const wishlistSnap = await getDocs(
//     query(wishlistRef, where('id', '==', albumId))
//   )

//   const wishlistUserNames = wishlistSnap.docs.flatMap(
//     doc => doc.data().userNames
//   )

//   return { ...albumData, wishlistUserNames }
// }

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
    console.error('❌ Error: usuario no autenticado')
    return []
  }

  console.log(`📡 Consultando colecciones en Firebase para usuario: ${userId}`)

  try {
    // 🔹 Referencia a la colección "collections"
    const colRef = collection(db, 'collections')

    // 🔍 Consulta para obtener las colecciones del usuario por su userId
    const q = query(colRef, where('userId', '==', userId))
    const result = await getDocs(q)

    if (result.empty) {
      console.warn(`⚠️ No se encontraron colecciones para el usuario ${userId}`)
      return []
    }

    // ✅ Mapear los resultados y devolver un array de colecciones
    const collectionsData = result.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

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
export const addToWishlist = async (userId, album, updateState) => {
  try {
    if (!userId || !album || !album.id) {
      console.error('❌ Error: userId o album.id no son válidos:', {
        userId,
        album
      })
      return
    }

    console.log('📀 Intentando añadir álbum a la wishlist:', album)

    // Obtenemos el nombre del usuario
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

    // Estructura de la entrada de wishlist
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

    // Añadir el documento a la colección "wishlist"
    await addDoc(collection(db, wishlistCollectionName), wishlistItemData)
    console.log('✅ Álbum añadido a la wishlist con éxito en Firestore.')
    if (updateState) updateState(true)
  } catch (error) {
    console.error('❌ Error añadiendo a wishlist:', error)
  }
}

// REMOVE FROM WISHLIST
export const removeFromWishlist = async (userId, albumId) => {
  try {
    const colRef = collection(db, wishlistCollectionName)
    const q = query(
      colRef,
      where('userId', '==', userId),
      where('albumId', '==', albumId)
    )
    const snapshot = await getDocs(q)
    snapshot.forEach(async docSnap => {
      await deleteDoc(docSnap.ref)
    })
    console.log('✅ Álbum eliminado de la wishlist en Firestore.')
  } catch (error) {
    console.error('❌ Error eliminando de wishlist:', error)
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
    console.error('❌ Error obteniendo wishlist:', error)
    return []
  }
}
