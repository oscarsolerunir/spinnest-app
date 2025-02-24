import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { UserProvider } from '../context/UserContext'
import { AlbumsProvider } from '../context/AlbumsContext'
import { WishlistProvider } from '../context/WishlistContext'
import { ConversationsProvider } from '../context/ConversationsContext'
import { MessagesProvider } from '../context/MessagesContext'
import PrivateRoute from '../components/Common/PrivateRoute'
import DefaultLayout from '../layouts/DefaultLayout'
import HomePage from '../pages/HomePage'
import AddAlbumPage from '../pages/AddAlbumPage'
import AlbumDetailsPage from '../pages/AlbumDetailsPage'
import UserAlbumsPage from '../pages/UserAlbumsPage'
import AddCollectionPage from '../pages/AddCollectionPage'
import EditCollectionPage from '../pages/EditCollectionPage'
import CollectionDetailsPage from '../pages/CollectionDetailsPage'
import UserCollectionsPage from '../pages/UserCollectionsPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import UserProfilePage from '../pages/UserProfilePage'
import EditProfilePage from '../pages/EditProfilePage'
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
      <AlbumsProvider>
        <WishlistProvider>
          <ConversationsProvider>
            <MessagesProvider>
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
                          <EditCollectionPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/collection/:id"
                      element={
                        <PrivateRoute>
                          <CollectionDetailsPage />
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
                          <UserProfilePage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/edit-profile"
                      element={
                        <PrivateRoute>
                          <EditProfilePage />
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
            </MessagesProvider>
          </ConversationsProvider>
        </WishlistProvider>
      </AlbumsProvider>
    </UserProvider>
  )
}

export default RouterApp
