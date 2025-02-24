import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import Navigation from './Navigation'
import { FaBars, FaTimes } from 'react-icons/fa'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-dark text-light p-5 border-b-2 border-darkaccent">
      <div className="flex gap-2 items-center">
        <button
          className="text-light text-2xl md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
        <Link to="/" className="text-light hover:no-underline">
          <Logo />
        </Link>
      </div>
      <Navigation menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </header>
  )
}

export default Header
