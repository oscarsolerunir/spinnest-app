import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { UserProvider } from '../providers/UserContext'
import PrivateRoute from '../components/Common/PrivateRoute'
import DefaultLayout from '../layouts/Default'
import Home from '../pages/Home'
import AddAlbum from '../pages/Albums/AddAlbum'
import ViewAlbum from '../pages/Albums/ViewAlbum'
import ViewUserAlbums from '../pages/Albums/ViewUserAlbums'
import AddCollection from '../pages/Collections/AddCollection'
import EditCollection from '../pages/Collections/EditCollection'
import ViewCollectionPage from '../pages/Collections/ViewCollectionPage'
import ViewUserCollections from '../pages/Collections/ViewUserCollections'
import Login from '../components/User/Login'
import Register from '../components/User/Register'
import UserProfile from '../pages/User/UserProfile'

const RouterApp = () => {
  return (
    <UserProvider>
      <Router>
        <DefaultLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/add-album"
              element={
                <PrivateRoute>
                  <AddAlbum />
                </PrivateRoute>
              }
            />
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
              path="/add-collection"
              element={
                <PrivateRoute>
                  <AddCollection />
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
            <Route
              path="/collection/:id"
              element={
                <PrivateRoute>
                  <ViewCollectionPage />
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
    </UserProvider>
  )
}

export default RouterApp
