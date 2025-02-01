import ListCollections from '../../components/Collections/ListCollections'
import { useUser } from '../../providers/UserContext'

const Collections = () => {
  const { userId } = useUser()

  return (
    <div>
      <ListCollections userId={userId} />
    </div>
  )
}

export default Collections
