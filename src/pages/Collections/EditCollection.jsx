import { useNavigate } from 'react-router-dom'
import EditCollection from '../../components/Collections/EditCollection'

const EditCollectionPage = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/collections')
  }

  return (
    <div>
      <h1>Editar Colección</h1>
      <EditCollection />
      <button onClick={handleBack}>Volver a Colecciones</button>
    </div>
  )
}

export default EditCollectionPage
