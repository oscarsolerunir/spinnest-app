import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getAlbumById } from '../../services/api'
import styled from 'styled-components'

const AlbumDetailContainer = styled.div`
  padding: 20px;
  text-align: center;
`

const BackButton = styled(Link)`
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  &:hover {
    background-color: #0056b3;
  }
`

const AlbumDetails = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const location = useLocation()

  useEffect(() => {
    getAlbumById(id).then(data => setAlbum(data))
  }, [id])

  if (!album) return <div>Loading...</div>

  // Determine the previous page and button text
  const previousPage = location.state?.from || '/'
  const buttonText = previousPage === '/' ? 'Back to home' : 'Back to my albums'

  return (
    <AlbumDetailContainer>
      <h1>{album.name}</h1>
      <img src={album.image} alt={album.name} />
      <p>Artist: {album.artist}</p>
      <p>Year: {album.year}</p>
      <p>Genre: {album.genre}</p>
      <p>Label: {album.label}</p>
      <BackButton to={previousPage}>{buttonText}</BackButton>
    </AlbumDetailContainer>
  )
}

export default AlbumDetails
