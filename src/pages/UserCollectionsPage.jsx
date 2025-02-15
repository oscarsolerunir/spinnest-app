import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import ListCollections from '../components/Collections/ListCollections'

const UserCollectionsPage = () => {
  const [user] = useAuthState(auth) // No necesitamos el estado de colecciones aquí

  return (
    <div>
      <h1>Tus colecciones</h1>
      {user?.uid ? (
        <ListCollections userId={user.uid} />
      ) : (
        <p>No has añadido ninguna colección todavía.</p>
      )}
      <Link to="/add-collection">
        <button>Añadir colección</button>
      </Link>
    </div>
  )
}

export default UserCollectionsPage
