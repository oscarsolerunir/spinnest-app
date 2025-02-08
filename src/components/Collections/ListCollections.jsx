import { useEffect, useState } from 'react'
import { getCollectionsByUser } from '../../services/api'
import ItemCollection from './ItemCollection'

const ListCollections = ({ userId, collections, onClick }) => {
  const [collectionsState, setCollectionsState] = useState(collections || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userId) {
      const fetchCollections = async () => {
        try {
          const data = await getCollectionsByUser(userId)
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
    } else {
      setLoading(false)
    }
  }, [userId])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  if (collectionsState.length === 0) {
    return <p>No tienes colecciones.</p>
  }

  return (
    <div>
      {collectionsState.map(collection => (
        <ItemCollection
          key={collection.id}
          collection={collection}
          onClick={onClick}
        />
      ))}
    </div>
  )
}

export default ListCollections
