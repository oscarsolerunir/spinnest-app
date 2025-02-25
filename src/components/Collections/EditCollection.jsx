import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCollections } from '../../contexts/CollectionsContext'
import { useUser } from '../../contexts/UserContext'
import CollectionForm from './CollectionForm'
import { getAlbumsByUser } from '../../services/api'

const EditCollection = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { collections, updateCollection, deleteCollection } = useCollections()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userAlbums, setUserAlbums] = useState([])

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = collections.find(collection => collection.id === id)
        if (!data) {
          throw new Error('Colección no encontrada')
        }
        setCollection(data)
      } catch {
        setError(
          'Hubo un error al cargar la colección. Por favor, inténtalo de nuevo.'
        )
      } finally {
        setLoading(false)
      }
    }

    const fetchUserAlbums = async () => {
      try {
        const data = await getAlbumsByUser(user.uid)
        setUserAlbums(data)
      } catch {
        setError(
          'Hubo un error al cargar los álbumes del usuario. Por favor, inténtalo de nuevo.'
        )
      }
    }

    if (user && user.uid) {
      fetchCollection()
      fetchUserAlbums()
    } else {
      setError('Usuario no autenticado.')
      setLoading(false)
    }
  }, [id, user, collections])

  const handleSubmit = async collectionData => {
    const updatedCollection = {
      ...collectionData,
      userName: user.displayName || user.name || 'Usuario desconocido'
    }

    try {
      await updateCollection(id, updatedCollection, user)
      alert('La colección se ha actualizado con éxito.')
      navigate(`/collections`)
    } catch {
      setError(
        'Hubo un error actualizando la colección. Por favor, inténtalo de nuevo.'
      )
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCollection(id)
      alert('La colección se ha eliminado con éxito.')
      navigate('/collections')
    } catch {
      setError(
        'Hubo un error eliminando la colección. Por favor, inténtalo de nuevo.'
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
    <div className="mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Colección</h1>
      <CollectionForm
        initialName={collection.name}
        initialDescription={collection.description}
        initialPrivacy={collection.privacy}
        initialAlbums={collection.albums}
        userAlbums={userAlbums}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onCancel={() => navigate('/collections')}
        submitButtonText="Actualizar Colección"
      />
    </div>
  )
}

export default EditCollection
