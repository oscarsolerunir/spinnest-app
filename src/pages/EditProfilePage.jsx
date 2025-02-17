import { useNavigate } from 'react-router-dom'
import UserProfileForm from '../components/User/UserProfileForm'

const EditProfilePage = () => {
  const navigate = useNavigate()

  const handleCancel = () => {
    navigate('/profile') // Navega a la página de perfil de usuario
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>
      <UserProfileForm />
      <button
        onClick={handleCancel}
        className="mt-4 px-4 py-2 text-white rounded"
      >
        Cancelar
      </button>
    </div>
  )
}

export default EditProfilePage
