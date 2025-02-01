import { Link } from 'react-router-dom'
import styled from 'styled-components'

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  &:hover {
    color: inherit;
  }
`

const Logo = () => {
  return (
    <h2>
      <StyledLink to="/">
        <strong>Spinnest App</strong>
      </StyledLink>
    </h2>
  )
}

export default Logo
