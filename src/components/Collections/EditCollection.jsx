import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCollectionById,
  updateCollection,
  deleteCollection,
  getAlbumsByUser
} from '../../services/api'
import { useUser } from '../../providers/UserContext'
import CollectionForm from './CollectionForm'

const EditCollection = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userAlbums, setUserAlbums] = useState([])

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = await getCollectionById(id)
        setCollection(data)
      } catch (error) {
        console.error('Error fetching collection:', error)
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
      } catch (error) {
        console.error('Error fetching user albums:', error)
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
  }, [id, user])

  const handleSubmit = async collectionData => {
    try {
      await updateCollection(id, collectionData)
      alert('La colección se ha actualizado con éxito.')
      navigate(`/collections`)
    } catch (error) {
      console.error('Error updating collection:', error)
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
    } catch (error) {
      console.error('Error deleting collection:', error)
      setError(
        'Hubo un error eliminando la colección. Por favor, inténtalo de nuevo.'
      )
    }
  }

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  return (
    <div>
      <h1>Editar Colección</h1>
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
