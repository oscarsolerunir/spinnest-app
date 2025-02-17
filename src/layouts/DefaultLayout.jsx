import Header from '../components/Common/Header'
import Footer from '../components/Common/Footer'

const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="bg-black p-5 text-white font-body">{children}</main>
      <Footer />
    </>
  )
}

export default DefaultLayout
