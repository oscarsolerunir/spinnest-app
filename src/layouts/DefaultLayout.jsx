import Header from '../components/Common/Header'
import Footer from '../components/Common/Footer'
import styled from 'styled-components'

export const Main = styled.main`
  padding: 20px;
  background-color: #f8f9fa;
`

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
