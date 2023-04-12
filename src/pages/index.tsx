import Plugboard from '@/components/dom/Plugboard'
import IO from '@/components/dom/IO'
import { useState, useEffect } from 'react'
import { ALPHA, initialRotors, initialReflector } from '@/_globals'
import RotorsScene from '@/components/canvas/Rotors'

interface Rotor {
  name: string
  wiring: string
  notch: string
  position: number
  innerRingOffset: number
  offset: number
  wireTable?: object
  inverseWireTable?: object
}

interface Machine {
  plugboard: object
  rotors: Rotor[]
  reflector: Reflector
  transformationLog?: object
}

interface Reflector {
  name: string
  wiring: string
  wireTable?: object
  inverseWireTable?: object
}

class Machine {
  constructor(plugboard, rotors, reflector) {
    this.plugboard = plugboard
    this.rotors = rotors
    this.reflector = reflector

    this.transformationLog = {}

    this.createReflectorTable()
    this.createRotorWiringTables()
    this.resetTransformationLog()
  }

  resetTransformationLog = function () {
    this.transformationLog.plugboard = {
      forwards: {
        enter: null,
        exit: null,
      },
      backwards: {
        enter: null,
        exit: null,
      },
    }

    this.transformationLog.reflector = {
      enter: null,
      exit: null,
    }

    // Doing it this way doesn't work, because we fill the array with references to the
    // same object, so when we change one of the objects, they all change
    // this.transformationLog.rotors = Array(this.rotors.length).fill({
    //   forwards: {
    //     enter: null,
    //     exit: null,
    //   },
    //   backwards: {
    //     enter: null,
    //     exit: null,
    //   },
    // })

    // Is there a better way to do this? this feels dumb

    this.transformationLog.rotors = Array(this.rotors.length)

    for (var i = 0; i < this.rotors.length; i++) {
      this.transformationLog.rotors[i] = { forwards: null, backwards: null }
      this.transformationLog.rotors[i].forwards = { enter: null, exit: null }
      this.transformationLog.rotors[i].backwards = { enter: null, exit: null }
    }
  }

  createRotorWiringTables = function () {
    this.rotors = this.rotors.map((rotor) => {
      let newRotor = { ...rotor }

      newRotor.wireTable = {}
      newRotor.inverseWireTable = {}

      for (var i = 0; i < ALPHA.length; i++) {
        newRotor.wireTable[ALPHA[i]] = rotor.wiring[i]
        newRotor.inverseWireTable[rotor.wiring[i]] = ALPHA[i]
      }

      return newRotor
    })
  }

  createReflectorTable = function () {
    this.reflector.wireTable = {}
    this.reflector.inverseWireTable = {}

    for (var i = 0; i < ALPHA.length; i++) {
      this.reflector.wireTable[ALPHA[i]] = this.reflector.wiring[i]
      this.reflector.inverseWireTable[this.reflector.wiring[i]] = ALPHA[i]
    }
  }

  stepRotor = function (rotorIndex) {
    const newWireTable = {}

    let currentLetter
    let nextLetter

    for (var i = 0; i < ALPHA.length; i++) {
      currentLetter = ALPHA[i]
      nextLetter = ALPHA[(i + 1) % ALPHA.length]
      newWireTable[currentLetter] =
        this.rotors[rotorIndex].wireTable[nextLetter]
    }

    this.rotors[rotorIndex].wireTable = newWireTable

    for (var i = 0; i < ALPHA.length; i++) {
      let letter = ALPHA[i]
      let encodedLetter = this.rotors[rotorIndex].wireTable[letter]
      this.rotors[rotorIndex].inverseWireTable[encodedLetter] = letter
    }

    this.rotors[rotorIndex].position =
      (this.rotors[rotorIndex].position + 1) % ALPHA.length
  }

  encodeChar = function (char) {
    char = char.toUpperCase()
    if (!ALPHA.includes(char)) return char

    this.resetTransformationLog()

    this.stepRotor(0)

    if (this.rotors[0].position === ALPHA.indexOf(this.rotors[0].notch)) {
      this.stepRotor(1)
    }

    if (this.rotors[1].position === ALPHA.indexOf(this.rotors[1].notch)) {
      this.stepRotor(2)
    }

    this.transformationLog.plugboard.forwards.enter = char
    char = this.plugboard[char] || char
    this.transformationLog.plugboard.forwards.exit = char

    for (let i = 0; i < this.rotors.length; i++) {
      this.transformationLog.rotors[i].forwards.enter = char
      char = this.rotors[i].wireTable[char]
      char = ALPHA[(ALPHA.indexOf(char) - this.rotors[i].position + 26) % 26]
      this.transformationLog.rotors[i].forwards.exit = char
    }

    this.transformationLog.reflector.enter = char
    char = this.reflector.wireTable[char]
    this.transformationLog.reflector.exit = char

    for (let i = this.rotors.length - 1; i > -1; i--) {
      this.transformationLog.rotors[i].backwards.enter = char
      char = ALPHA[(ALPHA.indexOf(char) + this.rotors[i].position) % 26]
      char = this.rotors[i].inverseWireTable[char]
      this.transformationLog.rotors[i].backwards.exit = char
    }

    this.transformationLog.plugboard.backwards.enter = char
    char = this.plugboard[char] || char
    this.transformationLog.plugboard.backwards.exit = char

    return char
  }

  encodeString = function (string) {
    return string
      .split('')
      .map((char) => this.encodeChar(char))
      .join('')
  }

  exportTransformationLog = function () {
    return this.transformationLog
  }

  exportMachineState = function () {
    return {
      plugboard: this.plugboard,
      rotors: this.rotors,
      reflector: this.reflector,
    }
  }
}

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
