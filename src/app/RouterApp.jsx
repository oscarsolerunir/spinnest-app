import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import UserAlbums from '../pages/User/UserAlbums'
import AlbumDetails from '../pages/Album/AlbumDetails'
import UploadAlbum from '../pages/Album/UploadAlbum'
import Login from '../components/User/Login'
import Register from '../components/User/Register'
import UserProfile from '../pages/User/UserProfile'
import DefaultLayout from '../layouts/DefaultLayout'
import PrivateRoute from '../components/Common/PrivateRoute'
import CreateCollection from '../components/Collection/CreateCollection'
import UserCollections from '../pages/User/UserCollections'
import UserCollection from '../pages/User/UserCollection'

const RouterApp = () => {
  return (
    <Router>
      <DefaultLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/my-albums"
            element={
              <PrivateRoute>
                <UserAlbums />
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
          <Route
            path="/create-collection"
            element={
              <PrivateRoute>
                <CreateCollection />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-collections"
            element={
              <PrivateRoute>
                <UserCollections />
              </PrivateRoute>
            }
          />
          <Route
            path="/collection/:id"
            element={
              <PrivateRoute>
                <UserCollection />
              </PrivateRoute>
            }
          />
        </Routes>
      </DefaultLayout>
    </Router>
  )
}

export default RouterApp
