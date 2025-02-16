import { useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'

const ItemCollection = ({ collection }) => {
  const navigate = useNavigate()
  const [currentUser] = useAuthState(auth)

  const handleClick = () => {
    navigate(`/collection/${collection.id}`)
  }

  const isOwner = currentUser && currentUser.uid === collection.userId

  return (
    <div
      onClick={handleClick}
      className="border border-gray-300 rounded-lg p-4 text-center cursor-pointer mb-5 transition-transform transform hover:scale-105"
    >
      <ul className="flex flex-wrap justify-center">
        {collection.albums.map(album => (
          <li key={album.id} className="m-2">
            <img
              src={album.image}
              alt={album.name}
              className="w-12 h-12 rounded-md"
            />
            <p className="text-sm">{album.name}</p>
          </li>
        ))}
      </ul>
      <h3 className="mt-2 mb-2 text-lg font-semibold">{collection.name}</h3>
      <p>{collection.description}</p>
      {isOwner && (
        <button
          onClick={e => {
            e.stopPropagation()
            navigate(`/edit-collection/${collection.id}`)
          }}
          className="mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Editar Colección
        </button>
      )}
    </div>
  )
}

export default ItemCollection
