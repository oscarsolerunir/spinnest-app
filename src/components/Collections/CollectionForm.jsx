import { useState, useEffect } from 'react'

const CollectionForm = ({
  initialName = '',
  initialDescription = '',
  initialPrivacy = 'public',
  initialAlbums = [],
  userAlbums = [],
  onSubmit,
  onDelete,
  onCancel,
  submitButtonText = 'Crear Colección'
}) => {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [privacy, setPrivacy] = useState(initialPrivacy)
  const [selectedAlbums, setSelectedAlbums] = useState(initialAlbums)
  const [error, setError] = useState('')

  useEffect(() => {
    setName(initialName)
    setDescription(initialDescription)
    setPrivacy(initialPrivacy)
    setSelectedAlbums(initialAlbums)
  }, [initialName, initialDescription, initialPrivacy, initialAlbums])

  const handleAlbumChange = album => {
    setSelectedAlbums(prev => {
      if (prev.some(a => a.id === album.id)) {
        return prev.filter(a => a.id !== album.id)
      } else {
        return [...prev, album]
      }
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!name || selectedAlbums.length === 0) {
      setError('La colección debe tener al menos un nombre y un álbum.')
      return
    }
    onSubmit({ name, description, privacy, albums: selectedAlbums })
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
        {userAlbums.map(album => (
          <div key={album.id}>
            <input
              type="checkbox"
              checked={selectedAlbums.some(a => a.id === album.id)}
              onChange={() => handleAlbumChange(album)}
            />
            <img src={album.image} alt={album.name} width="50" height="50" />
            {album.name}
          </div>
        ))}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">{submitButtonText}</button>
      {onDelete && (
        <button type="button" onClick={onDelete}>
          Eliminar Colección
        </button>
      )}
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Volver a Colecciones
        </button>
      )}
    </form>
  )
}

export default CollectionForm
