import { initializeApp } from 'firebase/app'
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signOut
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  where,
  onSnapshot,
  documentId
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
}

const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
setPersistence(auth, browserLocalPersistence)

// Exportar los módulos necesarios
export {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  where,
  onSnapshot,
  documentId,
  signOut
}
