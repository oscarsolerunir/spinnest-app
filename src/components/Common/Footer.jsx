const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-gray py-4 text-center">
      <p>&copy; {currentYear} Spinnest App</p>
    </footer>
  )
}

export default Footer
