import { useEffect, useState } from 'react'
import { getCollectionsByUser } from '../../services/api'
import ItemCollection from './ItemCollection'

const ListCollections = ({ userId }) => {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await getCollectionsByUser(userId)
        setCollections(data)
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
  }, [userId])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  if (collections.length === 0) {
    return <p>No tienes colecciones.</p>
  }

  return (
    <div>
      {collections.map(collection => (
        <ItemCollection key={collection.id} collection={collection} />
      ))}
    </div>
  )
}

export default ListCollections
