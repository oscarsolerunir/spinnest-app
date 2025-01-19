import Header from '../../components/Common/Header'
import Footer from '../../components/Common/Footer'
import { Main } from './styles'

const DefaultLayout = ({ children }) => {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  )
}

export default DefaultLayout
