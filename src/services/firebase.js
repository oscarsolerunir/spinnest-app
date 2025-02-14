import { initializeApp } from 'firebase/app'
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

// 📌 Configuración de Firebase (asegúrate de que las variables de entorno estén definidas)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY || '',
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_APP_ID || '',
  databaseURL: import.meta.env.VITE_DATABASE_URL || ''
}

// 📌 Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const rtdb = getDatabase(firebaseApp) // Inicializar Realtime Database

// 📌 Configurar la persistencia de autenticación
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Persistencia de autenticación configurada correctamente')
  })
  .catch(error => {
    console.error(
      '❌ Error configurando la persistencia de autenticación:',
      error
    )
  })

// 📌 Escuchar cambios en la autenticación en tiempo real
onAuthStateChanged(auth, user => {
  if (user) {
    console.log('✅ Usuario autenticado:', user)
  } else {
    console.warn('⚠️ No hay usuario autenticado.')
  }
})

// 📌 Exportar los módulos necesarios
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

// Hacer accesible en la consola del navegador
window.auth = auth
window.db = db
window.getDocs = getDocs
window.collection = collection
