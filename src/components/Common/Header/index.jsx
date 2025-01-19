import Logo from '../Logo'
import NavItems from '../NavItems'
import { HeaderContainer, NavContainer } from './styles'

const Header = () => {
  return (
    <HeaderContainer>
      <Logo />
      <NavContainer>
        <NavItems />
      </NavContainer>
    </HeaderContainer>
  )
}

export default Header
