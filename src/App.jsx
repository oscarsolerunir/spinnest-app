import RouterApp from './app/RouterApp'
import { auth, db } from './services/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Exponer Firebase en el objeto global `window`
window.auth = auth
window.db = db
window.doc = doc
window.getDoc = getDoc

console.log('Firebase disponible en la consola. Prueba ejecutar:')
console.log('auth.currentUser?.uid') // Para obtener el usuario actual
console.log(
  "getDoc(doc(db, 'albums', 'album123')).then(snapshot => console.log(snapshot.data()));"
) // Para probar una consulta

function App() {
  return <RouterApp />
}

export default App
