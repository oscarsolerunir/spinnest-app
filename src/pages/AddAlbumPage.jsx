import { addToMyAlbums } from '../services/api'
import { auth } from '../services/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import AddAlbum from '../components/Albums/AddAlbum'

const AddAlbumPage = () => {
  const [user] = useAuthState(auth)

  const handleSaveAlbum = async album => {
    if (!user) {
      alert('Debes iniciar sesión para añadir un álbum.')
      return
    }

    const normalizedAlbum = {
      id: album.id,
      name: album.name || 'Desconocido',
      artist: album.artist || 'Desconocido',
      year: album.year || 'Desconocido',
      genre: album.genre || 'Desconocido',
      label: album.label || 'Desconocido',
      country: album.country || 'Desconocido',
      released: album.released || 'Desconocido',
      notes: album.notes || 'Sin notas',
      formats: album.formats || [],
      lowest_price: album.lowest_price || 0,
      tracklist: album.tracklist || [],
      styles: album.styles || [],
      rating: album.rating || 0,
      rating_count: album.rating_count || 0,
      credits: album.credits || 'No disponible',
      discogs_url: album.discogs_url || '',
      videos: album.videos || [],
      image: album.image || '',
      all_images: album.all_images || []
    }

    await addToMyAlbums(user.uid, normalizedAlbum)
  }

  return (
    <div>
      <h1 className="text-2xl font-medium mb-4">Añadir un álbum</h1>
      <AddAlbum handleSaveAlbum={handleSaveAlbum} />
    </div>
  )
}

export default AddAlbumPage
