import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { UserProvider } from '../providers/UserContext'
import PrivateRoute from '../components/Common/PrivateRoute'
import DefaultLayout from '../layouts/Default'
import Home from '../pages/Home'
import AddAlbum from '../pages/Albums/AddAlbum'
import ViewUserAlbums from '../pages/Albums/ViewUserAlbums'
import ViewAlbum from '../pages/Albums/ViewAlbum'
import ViewUserCollections from '../pages/Collections/ViewUserCollections'
import ViewCollection from '../pages/Collections/ViewCollection'
import EditCollection from '../pages/Collections/EditCollection'
import UserProfile from '../pages/User/UserProfile'
import Login from '../components/User/Login'
import Register from '../components/User/Register'

const RouterApp = () => {
  return (
    <UserProvider>
      <Router>
        <DefaultLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/albums"
              element={
                <PrivateRoute>
                  <ViewUserAlbums />
                </PrivateRoute>
              }
            />
            <Route path="/album/:id" element={<ViewAlbum />} />
            <Route
              path="/upload-album"
              element={
                <PrivateRoute>
                  <AddAlbum />
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
              path="/collections"
              element={
                <PrivateRoute>
                  <ViewUserCollections />
                </PrivateRoute>
              }
            />
            <Route
              path="/collection/:id"
              element={
                <PrivateRoute>
                  <ViewCollection />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-collection/:id"
              element={
                <PrivateRoute>
                  <EditCollection />
                </PrivateRoute>
              }
            />
          </Routes>
        </DefaultLayout>
      </Router>
    </UserProvider>
  )
}

export default RouterApp
