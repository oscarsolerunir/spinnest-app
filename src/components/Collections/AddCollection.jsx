import { useState, useEffect } from 'react'
import { getAlbumsByUser } from '../../services/api'
import { useUser } from '../../contexts/UserContext'
import { useCollections } from '../../contexts/CollectionsContext' // Importa el contexto de colecciones
import CollectionForm from './CollectionForm'
import { useNavigate } from 'react-router-dom'

const AddCollection = () => {
  const { user } = useUser()
  const { addCollection } = useCollections() // Usa la función addCollection del contexto
  const [userAlbums, setUserAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
      userId: user.uid,
      userName: user.displayName || user.name || 'Usuario desconocido'
    }

    try {
      await addCollection(newCollection) // Usa la función addCollection del contexto
      alert('La colección se ha creado con éxito.')
      navigate('/collections')
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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Añadir Colección</h1>
      <CollectionForm
        userAlbums={userAlbums}
        onSubmit={handleSubmit}
        submitButtonText="Crear Colección"
      />
    </div>
  )
}

export default AddCollection
