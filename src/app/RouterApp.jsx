import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom'
import AlbumsCollection from '../pages/Album/AlbumsCollection'
import AlbumDetails from '../pages/Album/AlbumDetails'
import UploadAlbum from '../pages/Album/UploadAlbum'
import Login from '../components/User/Login'
import Register from '../components/User/Register'
import AllAlbums from '../pages/Album/AllAlbums'
import UserProfile from '../pages/User/UserProfile'
import DefaultLayout from '../layouts/DefaultLayout'
import PrivateRoute from '../components/Common/PrivateRoute'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

const RouterApp = () => {
  const [user] = useAuthState(auth)

  return (
    <Router>
      <DefaultLayout>
        <Routes>
          <Route
            path="/"
            element={user ? <AllAlbums /> : <Navigate to="/login" />}
          />
          <Route
            path="/collection"
            element={
              <PrivateRoute>
                <AlbumsCollection />
              </PrivateRoute>
            }
          />
          <Route path="/album/:id" element={<AlbumDetails />} />
          <Route
            path="/upload-album"
            element={
              <PrivateRoute>
                <UploadAlbum />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/user-profile"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />
        </Routes>
      </DefaultLayout>
    </Router>
  )
}

export default RouterApp
