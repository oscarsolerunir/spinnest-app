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
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Cancelar
      </button>
    </div>
  )
}

export default EditProfilePage
