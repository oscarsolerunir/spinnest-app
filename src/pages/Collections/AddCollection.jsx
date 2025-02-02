import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'
import { getAlbumsByUser } from '../../services/api'
import AddCollection from '../../components/Collections/AddCollection'

const AddCollectionPage = () => {
  const [user] = useAuthState(auth)
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAlbums = async () => {
      if (user) {
        try {
          const data = await getAlbumsByUser(user.uid)
          setAlbums(data)
        } catch (error) {
          console.error('Error fetching albums:', error)
          setError(
            'Hubo un error al cargar los álbumes. Por favor, inténtalo de nuevo.'
          )
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAlbums()
  }, [user])

  if (loading) {
    return <p>Cargando...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  return (
    <div>
      <h1>Añadir Colección</h1>
      <AddCollection userId={user?.uid} albums={albums} />
    </div>
  )
}

export default AddCollectionPage
