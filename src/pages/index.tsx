import dynamic from 'next/dynamic'
import Plugboard from '@/components/dom/Plugboard'
import IO from '@/components/dom/IO'
import { useEffect, useState } from 'react'
import { initialReflector, initialRotors } from '@/_globals'

// Dynamic import is used to prevent a payload when the website
// starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })

// Dom components go here
export default function Page(props) {
  const [plugboardState, setPlugboardState] = useState({ A: 'B', B: 'A' })
  const [rotors, setRotors] = useState(initialRotors)
  const [reflector, setReflector] = useState(initialReflector)
  const [currentPressedKey, setCurrentPressedKey] = useState('')

  const [plainText, setPlainText] = useState('')
  const [cipherText, setCipherText] = useState('')

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const onTextAreaChange = (e) => {
    if (e.repeat == true) return

    let positions = [1, rotors[1].position, rotors[2].position]

    let newCipherText = [...e.target.value]
      .map((c) => {
        if (ALPHA.indexOf(c.toUpperCase()) === -1) return c

        let newChar = c.toUpperCase()

        newChar = plugboardState[newChar] || newChar

        for (let i = 0; i < 3; i++) {
          let idx = (ALPHA.indexOf(newChar) + positions[i]) % 26
          newChar = rotors[i].wiring[idx]
          console.log(`rotor ${i}: ${newChar} to ${rotors[i].wiring[idx]}`)
        }

        console.log(
          `reflector: ${newChar} to ${
            reflector.wiring[ALPHA.indexOf(newChar)]
          }`,
        )
        newChar = reflector.wiring[ALPHA.indexOf(newChar)]

        for (let i = 2; i > -1; i--) {
          let idx = (rotors[i].wiring.indexOf(newChar) - positions[i]) % 26
          idx = (idx + 26) % 26
          console.log(`rotor ${i}: ${newChar} to ${ALPHA[idx]}`)
          newChar = ALPHA[idx]
        }

        newChar = plugboardState[newChar] || newChar

        positions[0] = (positions[0] + 1) % 26

        if (rotors[0].wiring[positions[0]] === rotors[0].notch) {
          positions[1] = (positions[1] + 1) % 26
        }

        if (rotors[1].wiring[positions[1]] === rotors[1].notch) {
          positions[2] = (positions[2] + 1) % 26
        }

        return newChar
      })
      .join('')

    console.log(positions)

    setCipherText(newCipherText)
    setPlainText(e.target.value)
  }

  useEffect(() => {
    // substitute('A', rotors)
  }, [])

  return (
    <>
      <IO
        plugboardState={plugboardState}
        currentPressedKey={currentPressedKey}
        setCurrentPressedKey={setCurrentPressedKey}
        onTextAreaChange={onTextAreaChange}
        plainText={plainText}
        cipherText={cipherText}
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
