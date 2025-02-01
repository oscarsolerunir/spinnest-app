import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../services/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import AlbumList from '../Album/AlbumList'

const CreateCollection = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [albums, setAlbums] = useState([])
  const [selectedAlbums, setSelectedAlbums] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [user] = useAuthState(auth)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAlbums = async () => {
      if (user) {
        const q = query(
          collection(db, 'albums'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(q)
        const userAlbums = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setAlbums(userAlbums)
      }
    }

    fetchAlbums()
  }, [user])

  const handleCreateCollection = async e => {
    e.preventDefault()
    if (!name) {
      alert('Collection name is required')
      return
    }

    try {
      const newCollection = {
        name,
        description,
        privacy,
        albums: selectedAlbums,
        userId: user.uid,
        createdAt: new Date().toISOString()
      }
      await addDoc(collection(db, 'collections'), newCollection)
      alert('Collection created successfully')
      navigate('/user-collections')
    } catch (error) {
      console.error('Error creating collection:', error)
      alert('Error creating collection')
    }
  }

  const handleAlbumSelection = albumId => {
    setSelectedAlbums(prevSelectedAlbums => {
      if (prevSelectedAlbums.includes(albumId)) {
        return prevSelectedAlbums.filter(id => id !== albumId)
      } else {
        return [...prevSelectedAlbums, albumId]
      }
    })
  }

  const filteredAlbums = albums.filter(album =>
    album.artist.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <form onSubmit={handleCreateCollection}>
      <h2>Create Collection</h2>
      <label>Name:</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <label>Description:</label>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <label>Privacy:</label>
      <select value={privacy} onChange={e => setPrivacy(e.target.value)}>
        <option value="public">Public</option>
        <option value="private">Private</option>
        <option value="shared">Shared</option>
      </select>
      <label>Search by Artist:</label>
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search albums by artist"
      />
      <h3>Select Albums to Add to Collection</h3>
      {filteredAlbums.length > 0 ? (
        <AlbumList
          albums={filteredAlbums}
          onClick={handleAlbumSelection}
          selectedAlbums={selectedAlbums}
        />
      ) : (
        <p>No albums found.</p>
      )}
      <button type="submit">Create Collection</button>
    </form>
  )
}

export default CreateCollection
