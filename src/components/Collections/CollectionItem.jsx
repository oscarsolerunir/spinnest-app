import { useNavigate, Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../../services/firebase'

const CollectionItem = ({ collection }) => {
  const navigate = useNavigate()
  const [currentUser] = useAuthState(auth)

  const handleClick = () => {
    navigate(`/collection/${collection.id}`)
  }

  const isOwner = currentUser && currentUser.uid === collection.userId

  const albumsToShow = collection.albums.slice(0, 4)
  const emptySlots = 4 - albumsToShow.length

  return (
    <div
      onClick={handleClick}
      className="rounded-2xl p-4 cursor-pointer mb-5 transition-transform transform hover:bg-darkaccent group"
    >
      <div className="grid grid-cols-2 gap-2">
        {albumsToShow.map(album => (
          <div
            key={album.id}
            className="w-full aspect-square bg-darkaccent rounded-md"
          >
            <img
              src={album.image}
              alt={album.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={index}
            className="w-full aspect-square bg-darkaccent group-hover:bg-dark rounded-md"
          ></div>
        ))}
      </div>
      <h3 className="mt-2 mb-2 text-lg font-medium truncate">
        {collection.name}
      </h3>
      {collection.description && (
        <p className="text-light truncate">{collection.description}</p>
      )}
      <Link
        to={`/collection/${collection.id}`}
        className="hover:underline my-2 block text-primary"
      >
        Ver colección
      </Link>
      {isOwner && (
        <button
          onClick={e => {
            e.stopPropagation()
            navigate(`/edit-collection/${collection.id}`)
          }}
          className="mt-2 px-4 py-2 text-dark font-medium bg-neutral rounded-full hover:bg-neutralaccent"
        >
          Editar Colección
        </button>
      )}
    </div>
  )
}

export default CollectionItem
