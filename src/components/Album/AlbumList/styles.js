import styled from 'styled-components'

export const ListContainer = styled.div`
  padding: 20px;
`

export const ListGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  align-items: start;
  list-style: none;
  padding: 0;
`
