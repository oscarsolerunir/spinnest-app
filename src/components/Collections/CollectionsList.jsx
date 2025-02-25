import { useEffect, useState } from 'react'
import ItemCollection from './ItemCollection'
import { useCollections } from '../../contexts/CollectionsContext'

const CollectionsList = ({ userId, collections, onClick, allUsers }) => {
  const [collectionsState, setCollectionsState] = useState(collections || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { collections: contextCollections } = useCollections()

  useEffect(() => {
    if (collections) {
      setCollectionsState(collections)
      setLoading(false)
    }
  }, [collections])

  useEffect(() => {
    if (!collections) {
      if (!userId && !allUsers) return
      const fetchCollections = async () => {
        setLoading(true)
        try {
          let data = []
          if (allUsers) {
            data = contextCollections
          } else if (userId) {
            data = contextCollections.filter(
              collection => collection.userId === userId
            )
          }
          setCollectionsState(data)
        } catch (error) {
          console.error(error)
          setError(
            'Hubo un error al cargar las colecciones. Por favor, inténtalo de nuevo.'
          )
        } finally {
          setLoading(false)
        }
      }
      fetchCollections()
    }
  }, [userId, allUsers, collections, contextCollections])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p className="text-red-500 mt-4">{error}</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 py-4">
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

export default CollectionsList
