import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import AlbumsList from '../components/Albums/AlbumsList'
import { useCollections } from '../contexts/CollectionsContext'
import { getUserById } from '../services/api'

const CollectionDetailsPage = () => {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUser] = useAuthState(auth)
  const [userName, setUserName] = useState('Desconocido')
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  const { collections } = useCollections()

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = collections.find(collection => collection.id === id)
        if (!data) {
          throw new Error('Colección no encontrada')
        }
        setCollection(data)

        // Obtener el nombre del usuario creador de la colección
        const user = await getUserById(data.userId)
        setUserName(user.name)
        setUserId(user.id)
      } catch {
        setError(
          'Hubo un error al cargar la colección. Por favor, inténtalo de nuevo.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [id, collections])

  const handleBackClick = () => {
    navigate(-1)
  }

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (!collection) {
    return <p>No se encontró la colección.</p>
  }

  const isOwner = currentUser && currentUser.uid === collection.userId

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ver Colección</h1>
      <div className="mx-auto py-4">
        <h1 className="text-2xl font-bold mb-4">{collection.name}</h1>
        <p>
          <strong>Creada por:</strong>{' '}
          <Link to={`/user/${userId}`} className="text-primary hover:underline">
            {userName}
          </Link>
        </p>
        <p>
          <strong>Descripción:</strong> {collection.description}
        </p>
        <p>
          <strong>Privacidad:</strong>{' '}
          {collection.privacy === 'public' ? 'Pública' : 'Privada'}
        </p>
        <h2 className="text-xl font-semibold mt-4 mb-2">Álbums:</h2>
        <AlbumsList
          albums={collection.albums}
          showCollectedBy={false}
          showDetailsLink={true}
          showWishlistButton={false}
          showMyAlbumsButton={false}
        />
        {isOwner && (
          <button
            onClick={() => navigate(`/edit-collection/${id}`)}
            className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold"
          >
            Editar Colección
          </button>
        )}
      </div>
      <button
        onClick={handleBackClick}
        className="mt-6 text-light rounded-full font-medium text-lg font-bold"
      >
        Volver
      </button>
    </div>
  )
}

export default CollectionDetailsPage
