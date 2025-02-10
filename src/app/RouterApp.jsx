import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { UserProvider } from '../providers/UserContext'
import PrivateRoute from '../components/Common/PrivateRoute'
import DefaultLayout from '../layouts/Default'
import HomePage from '../pages/HomePage'
import AddAlbumPage from '../pages/AddAlbumPage'
import AlbumDetailsPage from '../pages/AlbumDetailsPage'
import UserAlbumsPage from '../pages/UserAlbumsPage'
import AddCollectionPage from '../pages/AddCollectionPage'
import EditCollection from '../pages/Collections/EditCollection'
import ViewCollectionPage from '../pages/Collections/ViewCollection'
import UserCollectionsPage from '../pages/UserCollectionsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import UserProfile from '../pages/Profile/UserProfile'
import EditProfile from '../pages/Profile/EditProfile'
import UserConversationsPage from '../pages/UserConversationsPage'
import UserMessagesPage from '../pages/UserMessagesPage'
import FollowersPage from '../pages/FollowersPage'
import FollowingPage from '../pages/FollowingPage'
import UserPage from '../pages/UserPage'
import FeedPage from '../pages/FeedPage'
import WishlistPage from '../pages/WishlistPage'

const RouterApp = () => {
  return (
    <UserProvider>
      <Router>
        <DefaultLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/followers" element={<FollowersPage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/user/:userId" element={<UserPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route
              path="/add-album"
              element={
                <PrivateRoute>
                  <AddAlbumPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/albums"
              element={
                <PrivateRoute>
                  <UserAlbumsPage />
                </PrivateRoute>
              }
            />
            <Route path="/album/:id" element={<AlbumDetailsPage />} />
            <Route
              path="/add-collection"
              element={
                <PrivateRoute>
                  <AddCollectionPage />
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
                  <UserCollectionsPage />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <UserConversationsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages/:conversationId"
              element={
                <PrivateRoute>
                  <UserMessagesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <WishlistPage />
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
