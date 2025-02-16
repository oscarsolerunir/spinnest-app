import logo from '../../assets/spinnest-logo.svg'

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <img src={logo} alt="Spinnest Logo" className="h-12 w-12 mr-2" />
      <h2 className="text-2xl font-bold">Spinnest App</h2>
    </div>
  )
}

export default Logo
