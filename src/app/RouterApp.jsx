import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AlbumsCollection from '../pages/Album/AlbumsCollection'
import AlbumDetails from '../pages/Album/AlbumDetails'
import UploadAlbum from '../pages/Album/UploadAlbum'
import Login from '../components/User/Login'
import Register from '../components/User/Register'
import UserProfile from '../pages/User/UserProfile'
import DefaultLayout from '../layouts/DefaultLayout'
import PrivateRoute from '../components/Common/PrivateRoute'
import Home from '../pages/Home'

const RouterApp = () => {
  return (
    <Router>
      <DefaultLayout>
        <Routes>
          <Route path="/" element={<Home />} />
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
            path="/profile"
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
