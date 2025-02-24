import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../services/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'

const CollectionsContext = createContext()

export const CollectionsProvider = ({ children }) => {
  const [collections, setCollections] = useState([])
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'collections'),
      where('userId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCollections(data)
    })

    return () => unsubscribe()
  }, [currentUser])

  const addCollection = async collectionData => {
    const colRef = collection(db, 'collections')
    const docRef = await addDoc(colRef, collectionData)
    setCollections(prev => [...prev, { id: docRef.id, ...collectionData }])
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
