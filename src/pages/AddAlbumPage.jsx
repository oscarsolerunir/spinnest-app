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

    if (!albumArtist || albumArtist === 'Desconocido') {
      console.error(
        '⚠️ Error: No se puede guardar un álbum sin artista:',
        albumTitle
      )
      alert('Error: No se puede añadir el álbum sin un artista.')
      return
    }

    console.log('📀 Intentando guardar álbum:', {
      albumTitle,
      albumArtist,
      albumYear,
      albumGenre
    })

    let imageUrl = ''
    if (albumImage && typeof albumImage !== 'string') {
      try {
        imageUrl = await uploadImageToS3(albumImage)
      } catch (error) {
        console.error('❌ Error subiendo imagen:', error)
        return
      }
    } else {
      imageUrl = albumImage
    }

    // Obtener el nombre del usuario desde Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userName = userDoc.exists() ? userDoc.data().name : 'Unknown User'

    try {
      // ✅ Mejor obtener el álbum por ID (en lugar de `albumTitle`)
      const existingAlbum = await getAlbumById(albumDiscogsUrl)
      if (existingAlbum) {
        console.log('🔄 Álbum ya existe en Firebase, actualizando usuario...')
        await updateAlbum(existingAlbum.id, {
          userIds: [...existingAlbum.userIds, user.uid],
          userNames: [...existingAlbum.userNames, userName]
        })
      } else {
        console.log('🆕 Creando nuevo álbum en Firebase...')
        await createAlbum({
          name: albumTitle,
          artist: albumArtist,
          year: albumYear,
          genre: albumGenre || 'Desconocido',
          label: albumLabel || 'Desconocido',
          image: imageUrl || '', // Evita `undefined`
          country: albumCountry || 'Desconocido',
          released: albumReleased || 'Desconocido',
          notes: albumNotes || 'Sin notas',
          formats: albumFormats
            ? albumFormats.split(',').map(format => format.trim())
            : [],
          lowest_price: albumLowestPrice || 0,
          tracklist: albumTracklist
            ? albumTracklist.split(',').map(track => track.trim())
            : [],
          videos: albumVideos || [],
          styles: albumStyles
            ? albumStyles.split(',').map(style => style.trim())
            : [],
          rating: albumRating || 0,
          rating_count: albumRatingCount || 0,
          credits: albumCredits || 'No disponible',
          discogs_url: albumDiscogsUrl || '',
          createdAt: new Date().toISOString(),
          userIds: [user.uid],
          userNames: [userName]
        })
      }

      alert('✅ Álbum añadido correctamente')
      navigate('/albums')
    } catch (error) {
      console.error('❌ Error creando álbum:', error)
      alert(
        `Hubo un error al añadir el álbum. Inténtalo de nuevo. Error: ${error.message}`
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
