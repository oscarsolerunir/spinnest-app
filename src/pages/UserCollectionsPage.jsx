import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import CollectionsList from '../components/Collections/CollectionsList'
import { useCollections } from '../contexts/CollectionsContext'

const UserCollectionsPage = () => {
  const [user] = useAuthState(auth)
  const { collections } = useCollections()

  const userCollections = collections.filter(
    collection => collection.userId === user?.uid
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-medium mb-4">Tus colecciones</h1>
      <Link to="/add-collection">
        <button className="mt-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-medium">
          Añadir colección
        </button>
      </Link>
      {userCollections.length > 0 ? (
        <CollectionsList collections={userCollections} />
      ) : (
        <p className="mt-4">No has añadido ninguna colección todavía.</p>
      )}
    </div>
  )
}

export default UserCollectionsPage
