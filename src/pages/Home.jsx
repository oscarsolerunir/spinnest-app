import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import AllAlbums from './Album/AllAlbums'
import Login from '../components/User/Login'

const Home = () => {
  const [user] = useAuthState(auth)

  return (
    <div>
      <h1>
        Conecta, organiza y comparte tu colección de vinilos con coleccionistas
        de todo el mundo.
      </h1>
      <h2>
        Descubre, organiza y comparte vinilos con una comunidad global de
        coleccionistas apasionados
      </h2>
      <p>
        Spinnest es la plataforma perfecta para coleccionistas de vinilos.
        Organiza tu colección por género, año o artista, y comparte tus discos
        favoritos con otros entusiastas de la música. Únete a nuestra comunidad
        global, recibe recomendaciones personalizadas y mantente al tanto de los
        nuevos lanzamientos.
      </p>
      {user ? <AllAlbums /> : <Login />}
    </div>
  )
}

export default Home
