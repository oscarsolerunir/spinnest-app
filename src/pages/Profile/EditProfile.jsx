import { useNavigate } from 'react-router-dom'
import UserProfileForm from '../../components/User/UserProfileForm'

const EditProfile = () => {
  const navigate = useNavigate()

  const handleCancel = () => {
    navigate('/profile') // Navega a la página de perfil de usuario
  }

  return (
    <div>
      <h2>Editar Perfil</h2>
      <UserProfileForm />
      <button onClick={handleCancel}>Cancelar</button>
    </div>
  )
}

export default EditProfile
