import { useNavigate } from 'react-router-dom'
import EditUser from '../components/Users/EditUser'

const EditProfilePage = () => {
  const navigate = useNavigate()

  const handleCancel = () => {
    navigate('/profile') // Navega a la página de perfil de usuario
  }

  return (
    <div>
      <h2 className="text-2xl font-medium mb-4">Editar Perfil</h2>
      <EditUser />
      <button
        onClick={handleCancel}
        className="mt-4 px-4 py-2 text-light rounded"
      >
        Cancelar
      </button>
    </div>
  )
}

export default EditProfilePage
