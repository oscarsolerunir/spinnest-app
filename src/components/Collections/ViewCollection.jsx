import { useEffect, useState } from 'react'
import { getCollectionById } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'

const ViewCollection = () => {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser] = useAuthState(auth)
  const navigate = useNavigate()

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

    fetchCollection()
  }, [id])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  if (!collection) {
    return <p>No se encontró la colección.</p>
  }

  const isOwner = currentUser && currentUser.uid === collection.userId

  return (
    <div>
      <h1>{collection.name}</h1>
      <p>
        <strong>Descripción:</strong> {collection.description}
      </p>
      <p>
        <strong>Privacidad:</strong>{' '}
        {collection.privacy === 'public' ? 'Pública' : 'Privada'}
      </p>
      <h2>Álbums:</h2>
      <ul>
        {collection.albums.map(album => (
          <li key={album.id}>
            <img src={album.image} alt={album.name} width="50" height="50" />
            {album.name}
          </li>
        ))}
      </ul>
      {isOwner && (
        <button onClick={() => navigate(`/edit-collection/${id}`)}>
          Editar Colección
        </button>
      )}
    </div>
  )
}

export default ViewCollection
