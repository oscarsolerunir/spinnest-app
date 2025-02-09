import ListCollections from '../components/Collections/ListCollections'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCollectionsByUser } from '../services/api'

const UserCollectionsPage = () => {
  const [collections, setCollections] = useState([])
  const user = useAuthState(auth)

  useEffect(() => {
    if (user) {
      getCollectionsByUser(user.uid).then(data => setCollections(data))
    }
  }, [user])

  return (
    <div>
      <h1>Tus colecciones</h1>
      {collections.length > 0 ? (
        <ListCollections collections={collections} />
      ) : (
        <p>No has añadido ningún álbum todavía.</p>
      )}
      <Link to="/add-collection">
        <button>Añadir colección</button>
      </Link>
    </div>
  )
}

export default UserCollectionsPage
