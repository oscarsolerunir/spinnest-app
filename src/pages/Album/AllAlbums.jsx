import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAlbums } from '../../services/api'
import AlbumList from '../../components/Album/AlbumList'

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
      <h1>All Albums</h1>
      <AlbumList albums={albums} onClick={handleAlbumClick} context="/" />
    </div>
  )
}

export default AllAlbums
