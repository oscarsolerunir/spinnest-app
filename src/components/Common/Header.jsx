import { Link } from 'react-router-dom'
import Logo from './Logo'
import Navigation from './Navigation'

const Header = () => {
  return (
    <header className="bg-black text-white p-5 text-center border-b-2 border-darkgray ">
      <Link to="/" className="text-white no-underline hover:underline">
        <Logo />
      </Link>
      <Navigation />
    </header>
  )
}

export default Header
