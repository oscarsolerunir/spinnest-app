const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-light py-4 text-center border-t-2 border-darkaccent">
      <p>&copy; {currentYear} Spinnest App</p>
    </footer>
  )
}

export default Footer
