import { Link } from 'react-router-dom'
import Logo from './Logo'
import Navigation from './Navigation'

const Header = () => {
  return (
    <header className="bg-dark text-light p-5 text-center border-b-2 border-darkaccent">
      <Link to="/" className="text-light hover:no-underline">
        <Logo />
      </Link>
      <Navigation />
    </header>
  )
}

export default Header
