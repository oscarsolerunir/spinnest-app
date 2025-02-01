import { createAlbum } from '../../services/api'
import { uploadImageToS3 } from '../../services/aws'
import { auth, db } from '../../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import AddAlbum from '../../components/Albums/AddAlbum'

const UploadAlbum = () => {
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

    await createAlbum({
      name: albumTitle,
      artist: albumArtist,
      year: albumYear,
      genre: albumGenre,
      label: albumLabel,
      image: imageUrl || '', // Ensure image field is not undefined
      createdAt: new Date().toISOString(), // Add createdAt property
      userId: user.uid, // Associate album with user
      userName // Add userName
    })

    alert('Album added successfully')
    navigate('/collection')
  }

  return (
    <div>
      <h1>Upload your album</h1>
      <AddAlbum handleSaveAlbum={handleSaveAlbum} />
    </div>
  )
}

export default UploadAlbum
