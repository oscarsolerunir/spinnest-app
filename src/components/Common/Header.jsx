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

const Header = () => {
  return (
    <HeaderContainer>
      <Logo />
      <Navigation />
    </HeaderContainer>
  )
}

export default Header
