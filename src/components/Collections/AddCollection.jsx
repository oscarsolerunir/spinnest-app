import { useState } from 'react'
import { createCollection } from '../../services/api'

const AddCollection = ({ userId, albums }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [selectedAlbums, setSelectedAlbums] = useState([])
  const [error, setError] = useState('')

  const handleAlbumChange = album => {
    setSelectedAlbums(prev => {
      if (prev.some(a => a.id === album.id)) {
        return prev.filter(a => a.id !== album.id)
      } else {
        return [...prev, album]
      }
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!name || selectedAlbums.length === 0) {
      setError('La colección debe tener al menos un nombre y un álbum.')
      return
    }

    const newCollection = {
      name,
      description,
      privacy,
      albums: selectedAlbums.map(album => ({
        id: album.id,
        name: album.name,
        image: album.image
      })),
      createdAt: new Date().toISOString(),
      userId
    }

    try {
      await createCollection(newCollection)
      alert('La colección se ha creado con éxito.')
    } catch (error) {
      console.error('Error creando la colección:', error)
      setError(
        'Hubo un error creando la colección. Por favor, inténtalo de nuevo.'
      )
    }

    console.log('Colección creada:', newCollection)
  }

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
        <label>Álbums:</label>
        {albums.map(album => (
          <div key={album.id}>
            <input
              type="checkbox"
              checked={selectedAlbums.some(a => a.id === album.id)}
              onChange={() => handleAlbumChange(album)}
            />
            {album.name}
          </div>
        ))}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Crear Colección</button>
    </form>
  )
}

export default AddCollection
