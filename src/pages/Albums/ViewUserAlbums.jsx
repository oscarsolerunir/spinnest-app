import { useState, useEffect } from 'react'
import { getAlbumsByUser, deleteAlbum } from '../../services/api'
import { auth } from '../../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Link, useNavigate } from 'react-router-dom'
import ListAlbums from '../../components/Albums/ListAlbums'
import Modal from '../../components/Common/Modal'

const MyCollection = () => {
  const [albums, setAlbums] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      handleGetAlbums()
    }
  }, [user])

  const handleGetAlbums = () => {
    getAlbumsByUser(user.uid).then(data => {
      // Sort albums by createdAt in descending order
      const sortedAlbums = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setAlbums(sortedAlbums)
    })
  }

  const handleDeleteAlbum = async () => {
    if (selectedAlbum) {
      await deleteAlbum(selectedAlbum)
      handleGetAlbums()
      setShowModal(false)
    }
  }

  const confirmDeleteAlbum = id => {
    setSelectedAlbum(id)
    setShowModal(true)
  }

  const handleAlbumClick = id => {
    navigate(`/album/${id}`, { state: { from: '/albums' } })
  }

  return (
    <div>
      <h1>Mis álbums</h1>
      <Link to="/add-album">
        <button>Añadir un álbum</button>
      </Link>
      <ListAlbums
        albums={albums}
        confirmDeleteAlbum={confirmDeleteAlbum}
        onClick={handleAlbumClick}
      />
      <Modal
        showModal={showModal}
        handleDeleteAlbum={handleDeleteAlbum}
        setShowModal={setShowModal}
      />
    </div>
  )
}

export default MyCollection
