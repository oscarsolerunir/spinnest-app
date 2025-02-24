import { useState, useEffect } from 'react'
import { createCollection, getAlbumsByUser } from '../services/api'
import { useUser } from '../contexts/UserContext'
import CollectionForm from '../components/Collections/CollectionForm'

const AddCollectionPage = () => {
  const { user } = useUser()
  const [userAlbums, setUserAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserAlbums = async () => {
      try {
        const data = await getAlbumsByUser(user.uid)
        setUserAlbums(data)
      } catch {
        setError(
          'Hubo un error al cargar los álbumes del usuario. Por favor, inténtalo de nuevo.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (user && user.uid) {
      fetchUserAlbums()
    } else {
      setError('Usuario no autenticado.')
      setLoading(false)
    }
  }, [user])

  const handleSubmit = async collectionData => {
    const newCollection = {
      ...collectionData,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }

    try {
      await createCollection(newCollection)
      alert('La colección se ha creado con éxito.')
      window.location.href = '/collections'
    } catch {
      setError(
        'Hubo un error creando la colección. Por favor, inténtalo de nuevo.'
      )
    }
  }

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Añadir colección</h1>
      <CollectionForm
        userAlbums={userAlbums}
        onSubmit={handleSubmit}
        submitButtonText="Crear Colección"
      />
    </div>
  )
}

export default AddCollectionPage
