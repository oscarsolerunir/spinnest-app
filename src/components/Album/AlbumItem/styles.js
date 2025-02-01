import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const AlbumContainer = styled.div`
  list-style: none;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  text-align: center;
  position: relative;
  cursor: pointer;
`

export const AlbumImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 5px;
`

export const AlbumTitle = styled.h3`
  font-size: 1.2em;
  color: palevioletred;
`

export const DeleteButton = styled.button`
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
`

export const AddButton = styled.button`
  background-color: green;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
`

export const AlbumLink = styled(Link)`
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  position: relative;
`
