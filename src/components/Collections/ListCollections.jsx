import { useEffect, useState } from 'react'
import { getCollectionsByUser, getCollections } from '../../services/api'
import ItemCollection from './ItemCollection'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'

const ListCollections = ({ userId, collections, onClick, allUsers }) => {
  const [collectionsState, setCollectionsState] = useState(collections || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser] = useAuthState(auth)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        let data = []
        if (allUsers) {
          data = await getCollections()
        } else if (userId) {
          data = await getCollectionsByUser(userId)
        }
        setCollectionsState(data)
      } catch (error) {
        console.error('Error fetching collections:', error)
        setError(
          'Hubo un error al cargar las colecciones. Por favor, inténtalo de nuevo.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [userId, allUsers])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  if (!collectionsState || collectionsState.length === 0) {
    return <p>No hay colecciones disponibles.</p>
  }

  return (
    <div>
      {collectionsState.map(collection => (
        <ItemCollection
          key={collection.id}
          collection={collection}
          onClick={onClick}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}

export default ListCollections
