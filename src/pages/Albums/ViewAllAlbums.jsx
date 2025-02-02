import { useState, useEffect } from 'react'
import { getAlbums } from '../../services/api'
import ListAlbums from '../../components/Albums/ListAlbums'
import { useNavigate } from 'react-router-dom'

const AllAlbums = () => {
  const [albums, setAlbums] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    handleGetAlbums()
  }, [])

  const handleGetAlbums = () => {
    getAlbums().then(data => {
      // Sort albums by createdAt in descending order
      const sortedAlbums = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setAlbums(sortedAlbums)
    })
  }

  const handleAlbumClick = id => {
    navigate(`/album/${id}`, { state: { from: '/' } })
  }

  return (
    <div>
      <h1>Todos los álbums</h1>
      <ListAlbums albums={albums} onClick={handleAlbumClick} />
    </div>
  )
}

export default AllAlbums
