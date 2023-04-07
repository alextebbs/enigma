import dynamic from 'next/dynamic'
import Plugboard from '@/components/dom/Plugboard'
import IO from '@/components/dom/IO'
import { createContext, useState } from 'react'

// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })

// Dom components go here
export default function Page(props) {
  const [plugboardState, setPlugboardState] = useState({ A: 'B', B: 'A' })
  const [currentPressedKey, setCurrentPressedKey] = useState('')

  return (
    <>
      <IO
        plugboardState={plugboardState}
        currentPressedKey={currentPressedKey}
        setCurrentPressedKey={setCurrentPressedKey}
      />

      <Plugboard
        currentPressedKey={currentPressedKey}
        plugboardState={plugboardState}
        setPlugboardState={setPlugboardState}
      />
    </>
  )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
Page.canvas = (props) => <Logo scale={0.5} route='/blob' position-y={-1} />

export async function getStaticProps() {
  return { props: { title: 'Index' } }
}
