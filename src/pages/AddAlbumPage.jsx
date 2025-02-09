import { createAlbum, updateAlbum, getAlbumById } from '../services/api'
import { uploadImageToS3 } from '../services/aws'
import { auth, db } from '../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import AddAlbum from '../components/Albums/AddAlbum'

const AddAlbumPage = () => {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  const handleSaveAlbum = async ({
    albumTitle,
    albumArtist,
    albumYear,
    albumGenre,
    albumLabel,
    albumImage,
    albumCountry,
    albumReleased,
    albumNotes,
    albumFormats,
    albumLowestPrice,
    albumTracklist,
    albumVideos,
    albumStyles,
    albumRating,
    albumRatingCount,
    albumCredits,
    albumDiscogsUrl
  }) => {
    if (!user) {
      alert('You must be logged in to upload an album')
      return
    }

    let imageUrl = ''
    if (albumImage && typeof albumImage !== 'string') {
      try {
        imageUrl = await uploadImageToS3(albumImage)
      } catch (error) {
        console.error('Error uploading image:', error)
        return
      }
    } else {
      imageUrl = albumImage
    }

    // Obtener el nombre del usuario desde Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

    try {
      const existingAlbum = await getAlbumById(albumTitle)
      if (existingAlbum) {
        // Si el álbum ya existe, solo actualizamos los campos userIds y userNames
        await updateAlbum(existingAlbum.id, {
          userIds: [...existingAlbum.userIds, user.uid],
          userNames: [...existingAlbum.userNames, userName]
        })
      } else {
        // Si el álbum no existe, lo creamos con los campos userIds y userNames
        await createAlbum({
          name: albumTitle,
          artist: albumArtist,
          year: albumYear,
          genre: albumGenre,
          label: albumLabel,
          image: imageUrl || '', // Ensure image field is not undefined
          country: albumCountry,
          released: albumReleased,
          notes: albumNotes,
          formats: albumFormats.split(',').map(format => format.trim()), // Ensure formats is an array
          lowest_price: albumLowestPrice,
          tracklist: albumTracklist.split(',').map(track => track.trim()), // Ensure tracklist is an array
          videos: albumVideos,
          styles: albumStyles.split(',').map(style => style.trim()), // Ensure styles is an array
          rating: albumRating,
          rating_count: albumRatingCount,
          credits: albumCredits,
          discogs_url: albumDiscogsUrl,
          createdAt: new Date().toISOString(), // Add createdAt property
          userIds: [user.uid], // Associate album with user
          userNames: [userName] // Add userNames
        })
      }

      alert('Album added successfully')
      navigate('/albums')
    } catch (error) {
      console.error('Error creating album:', error)
      alert(
        `Hubo un error al añadir el álbum. Por favor, inténtalo de nuevo. Error: ${error.message}`
      )
    }
  }

  return (
    <div>
      <h1>Añadir un álbum</h1>
      <AddAlbum handleSaveAlbum={handleSaveAlbum} />
    </div>
  )
}

export default AddAlbumPage
