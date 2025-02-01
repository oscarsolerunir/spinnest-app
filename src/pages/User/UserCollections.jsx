import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../services/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc
} from 'firebase/firestore'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const CollectionContainer = styled.div`
  margin: 20px 0;
`

const CollectionItem = styled.div`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  position: relative;
`

const DeleteButton = styled.button`
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
  position: absolute;
  top: 10px;
  right: 10px;
`

const UserCollections = () => {
  const [collections, setCollections] = useState([])
  const [user] = useAuthState(auth)

  useEffect(() => {
    const fetchCollections = async () => {
      if (user) {
        const q = query(
          collection(db, 'collections'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(q)
        const userCollections = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setCollections(userCollections)
      }
    }

    fetchCollections()
  }, [user])

  const handleDeleteCollection = async collectionId => {
    try {
      await deleteDoc(doc(db, 'collections', collectionId))
      setCollections(
        collections.filter(collection => collection.id !== collectionId)
      )
      alert('Collection deleted successfully')
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Error deleting collection')
    }
  }

  return (
    <CollectionContainer>
      <h2>Mis Colecciones</h2>
      <Link to="/create-collection">
        <button type="button">Crear Colección</button>
      </Link>
      {collections.length > 0 ? (
        collections.map(collection => (
          <CollectionItem key={collection.id}>
            <h3>{collection.name}</h3>
            <p>{collection.description}</p>
            <p>{collection.privacy === 'public' ? 'Pública' : 'Privada'}</p>
            <Link to={`/collection/${collection.id}`}>Ver Colección</Link>
            <DeleteButton onClick={() => handleDeleteCollection(collection.id)}>
              Eliminar Colección
            </DeleteButton>
          </CollectionItem>
        ))
      ) : (
        <p>No se encontraron colecciones.</p>
      )}
    </CollectionContainer>
  )
}

export default UserCollections
