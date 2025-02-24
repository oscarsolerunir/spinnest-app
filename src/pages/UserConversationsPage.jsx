import UserConversations from '../components/User/UserConversations'

const UserConversationsPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mensajes</h1>
      <UserConversations />
    </div>
  )
}

export default UserConversationsPage
