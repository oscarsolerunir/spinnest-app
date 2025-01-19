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

// CREATE
export const createAlbum = async obj => {
  const colRef = collection(db, collectionName)
  const data = await addDoc(colRef, obj)
  return data.id
}

// UPDATE
export const updateAlbum = async (id, obj) => {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, obj)
}

// READ
export const getAlbums = async () => {
  const colRef = collection(db, collectionName)
  const result = await getDocs(query(colRef))
  return getArrayFromCollection(result)
}

// READ WITH WHERE
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

// DELETE
export const deleteAlbum = async id => {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

const getArrayFromCollection = collection => {
  return collection.docs.map(doc => {
    return { ...doc.data(), id: doc.id }
  })
}
