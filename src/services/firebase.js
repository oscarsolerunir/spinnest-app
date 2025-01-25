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
  apiKey: import.meta.env.VITE_API_KEY || 'mock_key',
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || 'mock_auth_domain',
  projectId: import.meta.env.VITE_PROJECT_ID || 'mock_project_id',
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || 'mock_storage_bucket',
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || 'mock_messaging_sender_id',
  appId: import.meta.env.VITE_APP_ID || 'mock_app_id'
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
