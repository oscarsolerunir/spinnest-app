import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../services/firebase'
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { createCollection as createCollectionAPI } from '../services/api'

const CollectionsContext = createContext()

export const CollectionsProvider = ({ children }) => {
  const [collections, setCollections] = useState([])
  useAuthState(auth)

  useEffect(() => {
    const q = query(collection(db, 'collections'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCollections(data)
    })

    return () => unsubscribe()
  }, [])

  const addCollection = async (collectionData, user) => {
    const docId = await createCollectionAPI(collectionData, user)
    setCollections(prev => [...prev, { id: docId, ...collectionData }])
  }

  const updateCollection = async (id, collectionData) => {
    const docRef = doc(db, 'collections', id)
    await updateDoc(docRef, collectionData)
    setCollections(prev =>
      prev.map(collection =>
        collection.id === id ? { ...collection, ...collectionData } : collection
      )
    )
  }

  const deleteCollection = async id => {
    const docRef = doc(db, 'collections', id)
    await deleteDoc(docRef)
    setCollections(prev => prev.filter(collection => collection.id !== id))
  }

  return (
    <CollectionsContext.Provider
      value={{ collections, addCollection, updateCollection, deleteCollection }}
    >
      {children}
    </CollectionsContext.Provider>
  )
}

export const useCollections = () => useContext(CollectionsContext)
