import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
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
