import Header from '../components/Common/Header'
import Footer from '../components/Common/Footer'

const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="bg-dark p-5 text-light h-full">{children}</main>
      <Footer />
    </>
  )
}

export default DefaultLayout
