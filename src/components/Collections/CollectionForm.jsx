import { useState } from 'react'

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre:
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descripción:
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Privacidad:
        </label>
        <select
          value={privacy}
          onChange={e => setPrivacy(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="public">Pública</option>
          <option value="private">Privada</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Álbums:
        </label>
        {userAlbums.map(album => (
          <div key={album.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedAlbums.some(a => a.id === album.id)}
              onChange={() => handleAlbumChange(album)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <img
              src={album.image}
              alt={album.name}
              className="w-12 h-12 rounded-md"
            />
            <span>{album.name}</span>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {submitButtonText}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar Colección
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Volver a Colecciones
          </button>
        )}
      </div>
    </form>
  )
}

export default CollectionForm
