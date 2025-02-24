import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  updateDoc,
  deleteDoc,
  where,
  onSnapshot,
  documentId,
  orderBy
} from 'firebase/firestore'
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || '',
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_APP_ID || '',
  databaseURL: import.meta.env.VITE_DATABASE_URL || ''
}

const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const rtdb = getDatabase(firebaseApp)
export const analytics = getAnalytics(firebaseApp)

setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error('Error configurando la persistencia de autenticación:', error)
})

onAuthStateChanged(auth, user => {
  if (!user) {
    console.warn('No hay usuario autenticado.')
  }
})

export {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  updateDoc,
  deleteDoc,
  where,
  onSnapshot,
  documentId,
  orderBy,
  signOut
}
