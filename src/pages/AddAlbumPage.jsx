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
    albumImage
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
        // Si el álbum ya existe, solo actualizamos el campo userIds
        await updateAlbum(existingAlbum.id, {
          userIds: [...existingAlbum.userIds, user.uid]
        })
      } else {
        // Si el álbum no existe, lo creamos con el campo userIds
        await createAlbum({
          name: albumTitle,
          artist: albumArtist,
          year: albumYear,
          genre: albumGenre,
          label: albumLabel,
          image: imageUrl || '', // Ensure image field is not undefined
          createdAt: new Date().toISOString(), // Add createdAt property
          userIds: [user.uid], // Associate album with user
          userName // Add userName
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
