import Plugboard from '@/components/dom/Plugboard'
import IO from '@/components/dom/IO'
import { useState } from 'react'
import { initialRotors, initialReflector } from '@/_globals'
import RotorsScene from '@/components/canvas/Rotors'
import Machine from '@/components/machine/Machine'

export default function Page(props) {
  const [machineState, setMachineState] = useState({
    plugboard: {},
    rotors: initialRotors,
    reflector: initialReflector,
  })

  const [transformationLog, setTransformationLog] = useState()

  const [plainText, setPlainText] = useState('')
  const [cipherText, setCipherText] = useState('')

  const [currentPressedKey, setCurrentPressedKey] = useState('')

  const onTextAreaChange = (e) => {
    let machine = new Machine(
      machineState.plugboard,
      initialRotors,
      initialReflector,
    )

    setCipherText(machine.encodeString(e.target.value))
    setPlainText(e.target.value)
    setMachineState(machine.exportMachineState())
    setTransformationLog(machine.exportTransformationLog())
  }

  return (
    <>
      <RotorsScene
        {...{
          machineState,
          transformationLog,
          currentPressedKey,
        }}
      />

      <IO
        {...{
          currentPressedKey,
          setCurrentPressedKey,
          onTextAreaChange,
          plainText,
          cipherText,
        }}
      />

      <Plugboard {...{ currentPressedKey, machineState, setMachineState }} />
    </>
  )
}
