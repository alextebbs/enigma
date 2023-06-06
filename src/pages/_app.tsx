import Header from '@/config'
import Layout from '@/components/dom/Layout'
import '@/styles/index.css'

export default function App({ Component }: { Component: React.FC }) {
  return (
    <>
      <Header />
      <Layout>
        <Component />
      </Layout>
    </>
  )
}
