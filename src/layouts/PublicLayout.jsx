import Header from '../components/Common/Header'
import Footer from '../components/Common/Footer'

const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="p-5">{children}</main>
      <Footer />
    </>
  )
}

export default PublicLayout
