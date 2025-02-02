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
  where
} from './firebase'

const collectionName = 'albums'
const collectionsCollectionName = 'collections'

// Helper function to convert Firestore collection to array
const getArrayFromCollection = collection => {
  return collection.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// CREATE ALBUM
export const createAlbum = async obj => {
  const colRef = collection(db, collectionName)
  const data = await addDoc(colRef, obj)
  return data.id
}

// UPDATE ALBUM
export const updateAlbum = async (id, obj) => {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, obj)
}

// DELETE ALBUM
export const deleteAlbum = async id => {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

// READ ALBUMS
export const getAlbums = async () => {
  const colRef = collection(db, collectionName)
  const result = await getDocs(query(colRef))
  return getArrayFromCollection(result)
}

// READ ALBUMS BY USER
export const getAlbumsByUser = async userId => {
  const colRef = collection(db, collectionName)
  const result = await getDocs(query(colRef, where('userId', '==', userId)))
  return getArrayFromCollection(result)
}

export const getAlbumById = async id => {
  const docRef = doc(db, collectionName, id)
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
