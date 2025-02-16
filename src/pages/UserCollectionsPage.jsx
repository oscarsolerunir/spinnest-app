import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import ListCollections from '../components/Collections/ListCollections'

const UserCollectionsPage = () => {
  const [user] = useAuthState(auth)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tus colecciones</h1>
      {user?.uid ? (
        <ListCollections userId={user.uid} />
      ) : (
        <p>No has añadido ninguna colección todavía.</p>
      )}
      <Link to="/add-collection">
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Añadir colección
        </button>
      </Link>
    </div>
  )
}

export default UserCollectionsPage
