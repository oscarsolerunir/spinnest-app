const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      <p>&copy; {currentYear} Spinnest App</p>
    </footer>
  )
}

export default Footer
