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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-0">
      <div>
        <label className="block text-sm font-medium text-light mb-2">
          Nombre:
        </label>
        <input
          type="text"
          value={name}
          placeholder="Nombre de la colección"
          onChange={e => setName(e.target.value)}
          required
          className="mb-4 p-4 text-lg block w-full border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light mb-2">
          Descripción:
        </label>
        <textarea
          value={description}
          placeholder="Descripción de la colección"
          onChange={e => setDescription(e.target.value)}
          className="mb-4 p-4 text-lg block w-full border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary h-40"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light mb-2">
          Privacidad:
        </label>
        <select
          value={privacy}
          onChange={e => setPrivacy(e.target.value)}
          className="mb-4 p-4 text-lg block w-full border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary"
        >
          <option value="public">Pública</option>
          <option value="private">Privada</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-light mb-2">
          Álbums:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userAlbums.map(album => (
            <div
              key={album.id}
              onClick={() => handleAlbumChange(album)}
              className={`flex flex-col items-center p-4 rounded-md cursor-pointer ${
                selectedAlbums.some(a => a.id === album.id)
                  ? 'border-2 border-primary bg-dark box-border'
                  : 'bg-darkaccent hover:bg-dark'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAlbums.some(a => a.id === album.id)}
                onChange={() => handleAlbumChange(album)}
                className="hidden"
              />
              <img
                src={album.image}
                alt={album.name}
                className="w-24 h-24 rounded-md mb-2"
              />
              <span className="text-light truncate text-center">
                {album.name}
              </span>
              <span className="text-neutral truncate text-center">
                {album.artist}
              </span>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-x-2">
        <button
          type="submit"
          className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold"
        >
          {submitButtonText}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-red-500 hover:bg-red-700 text-lg font-bold"
          >
            Eliminar Colección
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-dark text-light rounded hover:bg-dark"
          >
            Volver a Colecciones
          </button>
        )}
      </div>
    </form>
  )
}

export default CollectionForm
