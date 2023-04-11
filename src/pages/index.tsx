import Plugboard from '@/components/dom/Plugboard'
import IO from '@/components/dom/IO'
import { useState } from 'react'
import { initialReflector, initialRotors, ALPHA } from '@/_globals'
import RotorsScene from '@/components/canvas/Rotors'

export default function Page(props) {
  const [plugboardState, setPlugboardState] = useState({})
  const [rotors, setRotors] = useState(initialRotors)
  const [reflector, setReflector] = useState(initialReflector)
  const [currentPressedKey, setCurrentPressedKey] = useState('')

  const [transformationChain, setTransformationChain] = useState([])

  const [plainText, setPlainText] = useState('')
  const [cipherText, setCipherText] = useState('')

  const onTextAreaChange = (e) => {
    if (e.repeat == true) return

    let positions = [rotors[0].offset, rotors[1].offset, rotors[2].offset]

    let newCipherText = [...e.target.value].map((c) => {
      if (ALPHA.indexOf(c.toUpperCase()) === -1) return c

      let newChar = c.toUpperCase()
      let newTransformationChain = [newChar]
      setTransformationChain(newTransformationChain)

      const addToTransformationChain = (newTransformation) => {
        newChar = newTransformation
        newTransformationChain.push(newChar)
        setTransformationChain(newTransformationChain)
      }

      // First through the plugboard
      addToTransformationChain(plugboardState[newChar] || newChar)

      // Next through the rotors
      for (let i = 0; i < rotors.length; i++) {
        let idx = (ALPHA.indexOf(newChar) + positions[i]) % 26
        console.log(rotors[i].wiring[idx])
        addToTransformationChain(rotors[i].wiring[idx])
      }

      // Then through the reflector
      addToTransformationChain(reflector.wiring[ALPHA.indexOf(newChar)])

      // Then back through the rotors
      for (let i = rotors.length - 1; i > -1; i--) {
        let idx = (rotors[i].wiring.indexOf(newChar) - positions[i] + 26) % 26
        addToTransformationChain(ALPHA[idx])
      }

      // Finally, back through the plugboard again
      addToTransformationChain(plugboardState[newChar] || newChar)

      // Rotate the first rotor every time
      // positions[0] = (positions[0] + 1) % 26

      // // Rotate the second rotor if the first rotor is at its notch
      // if (rotors[0].wiring[positions[0]] === rotors[0].notch) {
      //   positions[1] = (positions[1] + 1) % 26
      // }

      // // Rotate the third rotor if the second rotor is at its notch
      // if (rotors[1].wiring[positions[1]] === rotors[1].notch) {
      //   positions[2] = (positions[2] + 1) % 26
      // }

      console.log(transformationChain)

      return newChar
    })

    setCipherText(newCipherText.join(''))
    setPlainText(e.target.value)
  }

  return (
    <>
      <RotorsScene {...{ rotors, currentPressedKey, transformationChain }} />

      <IO
        {...{
          plugboardState,
          currentPressedKey,
          setCurrentPressedKey,
          onTextAreaChange,
          plainText,
          cipherText,
        }}
      />

      <Plugboard
        {...{ currentPressedKey, plugboardState, setPlugboardState }}
      />
    </>
  )
}
