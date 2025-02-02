import ListCollections from '../../components/Collections/ListCollections'
import { useUser } from '../../providers/UserContext'
import { Link } from 'react-router-dom'

const ViewUserCollections = () => {
  const { userId } = useUser()

  return (
    <div>
      <h1>Tus colecciones</h1>
      <Link to="/add-collection">
        <button>Añadir colección</button>
      </Link>
      <ListCollections userId={userId} />
    </div>
  )
}

export default ViewUserCollections
