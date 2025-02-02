import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getCollectionById,
  updateCollection,
  deleteCollection,
  getAlbumsByUser
} from '../../services/api'

const EditCollection = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [albums, setAlbums] = useState([])
  const [userAlbums, setUserAlbums] = useState([])

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const data = await getCollectionById(id)
        setCollection(data)
        setName(data.name || '')
        setDescription(data.description || '')
        setPrivacy(data.privacy || 'public')
        setAlbums(data.albums || [])
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
        const userId = 'user-id' // Replace with actual user ID
        const data = await getAlbumsByUser(userId)
        setUserAlbums(data)
      } catch (error) {
        console.error('Error fetching user albums:', error)
        setError(
          'Hubo un error al cargar los álbumes del usuario. Por favor, inténtalo de nuevo.'
        )
      }
    }

    fetchCollection()
    fetchUserAlbums()
  }, [id])

  const handleAlbumChange = album => {
    setAlbums(prev => {
      if (prev.some(a => a.id === album.id)) {
        return prev.filter(a => a.id !== album.id)
      } else {
        return [...prev, album]
      }
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const updatedCollection = {
      name,
      description,
      privacy,
      albums
    }

    try {
      await updateCollection(id, updatedCollection)
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

  const albumsInCollection = albums
  const albumsNotInCollection = userAlbums.filter(
    album => !albums.some(a => a.id === album.id)
  )

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Descripción:</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Privacidad:</label>
        <select value={privacy} onChange={e => setPrivacy(e.target.value)}>
          <option value="public">Pública</option>
          <option value="private">Privada</option>
        </select>
      </div>
      <div>
        <label>Álbums en la colección:</label>
        {albumsInCollection.map(album => (
          <div key={album.id}>
            <input
              type="checkbox"
              checked={albums.some(a => a.id === album.id)}
              onChange={() => handleAlbumChange(album)}
            />
            <img src={album.image} alt={album.name} width="50" height="50" />
            {album.name}
          </div>
        ))}
      </div>
      <div>
        <label>Álbums no en la colección:</label>
        {albumsNotInCollection.map(album => (
          <div key={album.id}>
            <input
              type="checkbox"
              checked={albums.some(a => a.id === album.id)}
              onChange={() => handleAlbumChange(album)}
            />
            <img src={album.image} alt={album.name} width="50" height="50" />
            {album.name}
          </div>
        ))}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Actualizar Colección</button>
      <button type="button" onClick={handleDelete}>
        Eliminar Colección
      </button>
    </form>
  )
}

export default EditCollection
