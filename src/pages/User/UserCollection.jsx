import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../services/firebase'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore'
import { uploadImageToS3 } from '../../services/aws' // Importar desde aws.js
import AlbumList from '../../components/Album/AlbumList'
import styled from 'styled-components'

const CollectionDetailContainer = styled.div`
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

const UserCollection = () => {
  const { id } = useParams()
  const [collection, setCollection] = useState(null)
  const [albums, setAlbums] = useState([])

  useEffect(() => {
    const fetchCollection = async () => {
      const docRef = doc(db, 'collections', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const collectionData = docSnap.data()
        setCollection(collectionData)

        // Fetch album details
        const albumIds = collectionData.albums
        if (albumIds.length > 0) {
          const q = query(collection(db, 'albums'), where('id', 'in', albumIds))
          const querySnapshot = await getDocs(q)
          const albumDetails = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setAlbums(albumDetails)
        }
      } else {
        console.log('No such document!')
      }
    }

    fetchCollection()
  }, [id])

  const handleRemoveAlbum = async albumId => {
    const updatedAlbums = collection.albums.filter(id => id !== albumId)
    setCollection({ ...collection, albums: updatedAlbums })
    setAlbums(albums.filter(album => album.id !== albumId))

    // Update Firestore
    const docRef = doc(db, 'collections', id)
    await updateDoc(docRef, { albums: updatedAlbums })
  }

  if (!collection) return <div>Loading...</div>

  return (
    <CollectionDetailContainer>
      <h1>{collection.name}</h1>
      <p>{collection.description}</p>
      <p>Privacy: {collection.privacy}</p>
      <h3>Albums in this Collection:</h3>
      {albums.length > 0 ? (
        <AlbumList
          albums={albums}
          onClick={handleRemoveAlbum}
          context="collection"
        />
      ) : (
        <p>No albums in this collection.</p>
      )}
      <BackButton to="/my-collections">Back to Collections</BackButton>
    </CollectionDetailContainer>
  )
}

export default UserCollection
