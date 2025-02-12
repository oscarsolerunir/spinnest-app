import ListCollections from '../components/Collections/ListCollections'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCollectionsByUser } from '../services/api'

const UserCollectionsPage = () => {
  const [collections, setCollections] = useState([])
  const [user] = useAuthState(auth) // Desestructura correctamente el usuario

  useEffect(() => {
    if (!user?.uid) return // Evita ejecutar si el usuario no está autenticado

    console.log(`📡 Obteniendo colecciones para el usuario: ${user.uid}`)

    const fetchCollections = async () => {
      try {
        const data = await getCollectionsByUser(user.uid)
        setCollections(data)
        console.log(`📚 Colecciones obtenidas de Firebase:`, data)
      } catch (error) {
        console.error('❌ Error obteniendo colecciones:', error)
      }
    }

    fetchCollections()
  }, [user?.uid]) // Se ejecuta solo cuando el `user.uid` cambia

  return (
    <div>
      <h1>Tus colecciones</h1>
      {collections.length > 0 ? (
        <ListCollections collections={collections} />
      ) : (
        <p>No has añadido ninguna colección todavía.</p>
      )}
      <Link to="/add-collection">
        <button>Añadir colección</button>
      </Link>
    </div>
  )
}

export default UserCollectionsPage
