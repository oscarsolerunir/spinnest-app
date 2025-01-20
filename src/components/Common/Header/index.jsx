import Logo from '../Logo'
import NavItems from '../NavItems'
import { HeaderContainer } from './styles'

const Header = () => {
  return (
    <HeaderContainer>
      <Logo />
      <NavItems />
    </HeaderContainer>
  )
}

export default Header
