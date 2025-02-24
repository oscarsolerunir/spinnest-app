import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import CollectionsList from '../components/Collections/CollectionsList'

const UserCollectionsPage = () => {
  const [user] = useAuthState(auth)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tus colecciones</h1>
      <Link to="/add-collection">
        <button className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-bold">
          Añadir colección
        </button>
      </Link>
      {user?.uid ? (
        <CollectionsList userId={user.uid} />
      ) : (
        <p className="mt-4">No has añadido ninguna colección todavía.</p>
      )}
    </div>
  )
}

export default UserCollectionsPage
