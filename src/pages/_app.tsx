import { useRef, createContext } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/config'
import Layout from '@/components/dom/Layout'
import '@/styles/index.css'

export default function App({ Component, pageProps = { title: 'index' } }) {
  return (
    <>
      <Header title={pageProps.title} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
