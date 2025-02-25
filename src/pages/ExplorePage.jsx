import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../services/firebase'
import {
  addToMyAlbums,
  addToWishlist,
  removeFromWishlist,
  getCollections
} from '../services/api'
import { useNavigate, Link } from 'react-router-dom'
import { useAlbums } from '../contexts/AlbumsContext'
import AlbumsList from '../components/Albums/AlbumsList'
import CollectionsList from '../components/Collections/CollectionsList'
import UsersList from '../components/Users/UsersList'
import { FaChevronDown } from 'react-icons/fa'

const ExplorePage = () => {
  const { allAlbums, fetchAllAlbums } = useAlbums()
  const [collections, setCollections] = useState([])
  const [user] = useAuthState(auth)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortCriteria, setSortCriteria] = useState('dateAddedDesc')
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllAlbums()
    handleGetCollections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGetCollections = async () => {
    const data = await getCollections()
    const sortedCollections = data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    setCollections(sortedCollections)
  }

  const handleCollectionClick = id => {
    navigate(`/collection/${id}`, { state: { from: '/' } })
  }

  const handleAddToWishlist = async album => {
    try {
      await addToWishlist(user.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum a wishlist:', error)
    }
  }

  const handleRemoveFromWishlist = async albumId => {
    try {
      await removeFromWishlist(user.uid, albumId)
    } catch (error) {
      console.error('Error eliminando álbum de wishlist:', error)
    }
  }

  const handleAddToMyAlbums = async album => {
    try {
      await addToMyAlbums(user.uid, album)
    } catch (error) {
      console.error('Error añadiendo álbum:', error)
    }
  }

  const filteredAlbums = allAlbums
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
      <h1 className="text-2xl font-medium mb-4">Explorar</h1>
      <h2 className="text-xl font-medium mb-2">Todos los álbumes</h2>
      <Link to="/add-album" className="text-primary hover:underline mb-4 block">
        Añadir un nuevo álbum
      </Link>
      <div className="flex flex-col md:flex-row items-center gap-5 w-full">
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
      <AlbumsList
        albums={filteredAlbums}
        showCollectedBy={false}
        showWishlistButton={true}
        handleAddToWishlist={handleAddToWishlist}
        handleRemoveFromWishlist={handleRemoveFromWishlist}
        handleAddToMyAlbums={handleAddToMyAlbums}
      />

      <h2 className="text-xl font-medium mb-2">Todas las colecciones</h2>
      <Link
        to="/add-collection"
        className="text-primary hover:underline mb-4 block"
      >
        Añadir nueva colección
      </Link>
      <CollectionsList
        collections={collections}
        onClick={handleCollectionClick}
        allUsers
      />

      <h2 className="text-xl font-medium mb-2">Todos los usuarios</h2>
      {user ? (
        <UsersList userId={user.uid} />
      ) : (
        <p>Inicia sesión para ver usuarios.</p>
      )}
    </div>
  )
}

export default ExplorePage
