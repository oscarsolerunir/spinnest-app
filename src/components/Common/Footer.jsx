const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-white py-4 text-center">
      <p>&copy; {currentYear} My Music Collection</p>
    </footer>
  )
}

export default Footer
