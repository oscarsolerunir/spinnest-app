import UserConversations from '../components/Users/UserConversations'

const UserConversationsPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-medium mb-4">Mensajes</h1>
      <UserConversations />
    </div>
  )
}

export default UserConversationsPage
