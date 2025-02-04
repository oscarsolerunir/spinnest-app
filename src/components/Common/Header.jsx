import { Link } from 'react-router-dom'
import Logo from './Logo'
import Navigation from './Navigation'
import styled from 'styled-components'

const HeaderContainer = styled.header`
  background-color: #333;
  color: white;
  padding: 20px;
  text-align: center;
  border-bottom: 2px solid #444;
`

const LogoLink = styled(Link)`
  color: white;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Header = () => {
  return (
    <HeaderContainer>
      <LogoLink to="/">
        <Logo />
      </LogoLink>
      <Navigation />
    </HeaderContainer>
  )
}

export default Header
