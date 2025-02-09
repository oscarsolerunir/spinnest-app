import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { getAlbumById, addToWishlist, getWishlist } from '../services/api'
import styled from 'styled-components'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'

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

const WishlistButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`

const AlbumDetailsPage = () => {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [currentUser] = useAuthState(auth)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fetchAlbum = async () => {
      const data = await getAlbumById(id)
      setAlbum({ id, ...data }) // Asegurarse de que el ID del álbum se incluya en el estado
    }

    const checkWishlist = async () => {
      if (currentUser) {
        const wishlist = await getWishlist(currentUser.uid)
        const isInWishlist = wishlist.some(item => item.albumId === id)
        setIsInWishlist(isInWishlist)
      }
    }

    fetchAlbum()
    checkWishlist()
  }, [id, currentUser])

  const handleAddToWishlist = async () => {
    if (currentUser) {
      try {
        console.log('Album data:', album)
        console.log('Album ID:', album.id)
        console.log('Album Name:', album.name)
        console.log('Album Artist:', album.artist)
        console.log('Album Year:', album.year)
        console.log('Album Genre:', album.genre)
        console.log('Album Label:', album.label)
        console.log('Album Image:', album.image)
        if (
          album &&
          album.id &&
          album.name &&
          album.artist &&
          album.year &&
          album.genre &&
          album.label &&
          album.image
        ) {
          await addToWishlist(currentUser.uid, album)
          alert('Álbum añadido a la wishlist')
          setIsInWishlist(true)
        } else {
          alert(
            'Información del álbum incompleta. No se puede añadir a la wishlist.'
          )
        }
      } catch (error) {
        console.error('Error adding album to wishlist:', error)
        alert(
          'Hubo un error al añadir el álbum a la wishlist. Por favor, inténtalo de nuevo.'
        )
      }
    } else {
      alert('Debes iniciar sesión para añadir álbumes a la wishlist')
    }
  }

  if (!album) return <div>Cargando...</div>

  // Determine the previous page and button text
  const previousPage = location.state?.from || '/albums'
  const buttonText =
    previousPage === '/' ? 'Ver todos los albums' : 'Ver mis albums'

  const isOwner = currentUser && currentUser.uid === album.userId

  return (
    <AlbumDetailContainer>
      <h1>{album.name}</h1>
      <img src={album.image} alt={album.name} />
      <p>Artista: {album.artist}</p>
      <p>Año: {album.year}</p>
      <p>Género: {album.genre}</p>
      <p>Discográfica/s: {album.label}</p>
      {!isInWishlist && !isOwner && (
        <WishlistButton onClick={handleAddToWishlist}>
          Añadir a la wishlist
        </WishlistButton>
      )}
      <BackButton to={previousPage}>{buttonText}</BackButton>
    </AlbumDetailContainer>
  )
}

export default AlbumDetailsPage
