import { useEffect, useState } from 'react'
import { useAlbums } from '../contexts/AlbumsContext'
import { removeFromMyAlbums } from '../services/api'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import { Link } from 'react-router-dom'
import AlbumsList from '../components/Albums/AlbumsList'
import { FaChevronDown } from 'react-icons/fa'

const UserAlbumsPage = () => {
  const { userAlbums, fetchUserAlbums, removeAlbum } = useAlbums()
  const [user] = useAuthState(auth)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortCriteria, setSortCriteria] = useState('dateAddedDesc')
  const [setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserAlbums()
    }
  }, [user, fetchUserAlbums])

  const handleRemoveFromMyAlbums = async albumId => {
    try {
      await removeFromMyAlbums(user.uid, albumId)
      removeAlbum(albumId)
    } catch {
      setError(
        'Error eliminando álbum de mis albums. Por favor, inténtalo de nuevo.'
      )
    }
  }

  const filteredAlbums = userAlbums
    .filter(
      album =>
        album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortCriteria) {
        case 'dateAddedDesc':
          return new Date(b.dateAdded) - new Date(a.dateAdded)
        case 'dateAddedAsc':
          return new Date(a.dateAdded) - new Date(b.dateAdded)
        case 'yearDesc':
          return b.year - a.year
        case 'yearAsc':
          return a.year - b.year
        case 'genre':
          return a.genre.localeCompare(b.genre)
        case 'artistAsc':
          return a.artist.localeCompare(b.artist)
        case 'artistDesc':
          return b.artist.localeCompare(a.artist)
        case 'albumAsc':
          return a.name.localeCompare(b.name)
        case 'albumDesc':
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

  return (
    <div>
      <h1 className="text-2xl font-medium mb-4">Tus álbumes</h1>
      <Link to="/add-album">
        <button className="my-2 px-4 py-2 text-black rounded-full font-medium bg-primary hover:bg-accent text-lg font-medium">
          Añadir nuevo álbum
        </button>
      </Link>
      <div className="flex flex-col md:flex-row items-center gap-5 my-4 w-full">
        <div className="w-full md:w-80">
          <label className="block text-sm font-medium text-light mb-3">
            Buscar:
          </label>
          <input
            type="text"
            placeholder="Buscar por artista o álbum"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-4 p-4 text-lg border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary w-full"
          />
        </div>
        <div className="w-full md:w-80 relative">
          <label className="block text-sm font-medium text-light mb-3">
            Ordenar por:
          </label>
          <select
            value={sortCriteria}
            onChange={e => setSortCriteria(e.target.value)}
            className="mb-4 p-4 text-lg text-neutralaccent border-none rounded bg-darkaccent focus:outline-none focus:ring-2 focus:ring-primary active:outline-none active:ring-2 active:ring-primary w-full appearance-none"
          >
            <option value="artistAsc">Artista (de la A a la Z)</option>
            <option value="artistDesc">Artista (de la Z a la A)</option>
            <option value="albumAsc">Álbum (de la A a la Z)</option>
            <option value="albumDesc">Álbum (de la Z a la A)</option>
            <option value="yearDesc">Año (más nuevos)</option>
            <option value="yearAsc">Año (más antiguos)</option>
            <option value="genre">Género</option>
          </select>
          <FaChevronDown className="absolute right-5 top-12 mt-1 pointer-events-none text-light" />
        </div>
      </div>
      {userAlbums.length > 0 ? (
        <AlbumsList
          albums={filteredAlbums}
          handleRemoveFromMyAlbums={handleRemoveFromMyAlbums}
        />
      ) : (
        <p className="mt-4">No has añadido ningún álbum todavía.</p>
      )}
    </div>
  )
}

export default UserAlbumsPage
