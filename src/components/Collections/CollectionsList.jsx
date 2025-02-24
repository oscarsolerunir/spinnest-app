import { useEffect, useState } from 'react'
import { getCollectionsByUser, getCollections } from '../../services/api'
import ItemCollection from './ItemCollection'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'

const CollectionsList = ({ userId, collections, onClick, allUsers }) => {
  const [collectionsState, setCollectionsState] = useState(collections || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser] = useAuthState(auth)

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
            data = await getCollections()
          } else if (userId) {
            data = await getCollectionsByUser(userId)
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
  }, [userId, allUsers, collections])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p className="text-red-500 mt-4">{error}</p>
  }

  if (!collectionsState || collectionsState.length === 0) {
    return <p className="mt-4">No hay colecciones disponibles.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 py-4">
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

export default CollectionsList
