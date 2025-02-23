import Header from '../components/Common/Header'
import Footer from '../components/Common/Footer'

const DefaultLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-dark p-5 text-light">{children}</main>
      <Footer />
    </div>
  )
}

export default DefaultLayout
