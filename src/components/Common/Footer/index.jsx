const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      <p>&copy; {currentYear} My Music Collection</p>
    </footer>
  )
}

export default Footer
