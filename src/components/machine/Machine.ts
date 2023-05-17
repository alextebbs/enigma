import { ALPHA } from '@/_globals'

export interface WireTable {
  A?: string
  B?: string
  C?: string
  D?: string
  E?: string
  F?: string
  G?: string
  H?: string
  I?: string
  J?: string
  K?: string
  L?: string
  M?: string
  N?: string
  O?: string
  P?: string
  Q?: string
  R?: string
  S?: string
  T?: string
  U?: string
  V?: string
  W?: string
  X?: string
  Y?: string
  Z?: string
}

export interface Rotor {
  name: string
  wiring: string
  notch: string
  position: number
  offset: number
  wireTable?: WireTable
  inverseWireTable?: WireTable
}

export interface Log {
  plugboard: BidirectionalLogEntry
  rotors: BidirectionalLogEntry[]
  reflector: LogEntry
}

export interface BidirectionalLogEntry {
  forwards: LogEntry | null
  backwards: LogEntry | null
}

export interface LogEntry {
  enter: string | null
  exit: string | null
}

export interface Reflector {
  name: string
  wiring: string
  wireTable?: WireTable
  inverseWireTable?: WireTable
}

export interface MachineState {
  plugboard: WireTable
  rotors: Rotor[]
  reflector: Reflector
  transformationLog?: Log
}

export class Machine {
  plugboard: WireTable
  rotors: Rotor[]
  reflector: Reflector
  transformationLog?: Log

  constructor({ plugboard, rotors, reflector }: MachineState) {
    this.plugboard = plugboard
    this.rotors = rotors
    this.reflector = reflector

    this.createReflectorTable()
    this.createRotorWiringTables()

    this.transformationLog = {
      rotors: Array(this.rotors.length),
      reflector: { enter: null, exit: null },
      plugboard: {
        forwards: {
          enter: null,
          exit: null,
        },
        backwards: {
          enter: null,
          exit: null,
        },
      },
    }

    /* 
    QUESTION:

    Doing it this way doesn't work, because we fill the array with 
    references to the same object, so when we change one of the objects, 
    they all change 

    this.transformationLog.rotors = Array(this.rotors.length).fill({
      forwards: {
        enter: null,
        exit: null,
      },
      backwards: {
        enter: null,
        exit: null,
      },
    })
    
    Is there a better way to do this? This feels dumb.  */

    for (let i = 0; i < this.rotors.length; i++) {
      this.transformationLog.rotors[i] = { forwards: null, backwards: null }
      this.transformationLog.rotors[i].forwards = { enter: null, exit: null }
      this.transformationLog.rotors[i].backwards = { enter: null, exit: null }
    }
  }

  createRotorWiringTables = function (this: Machine) {
    this.rotors = this.rotors.map((rotor: Rotor) => {
      let newRotor = { ...rotor }

      newRotor.wireTable = {}
      newRotor.inverseWireTable = {}

      ALPHA.forEach((char, i) => {
        newRotor.wireTable[char] = rotor.wiring[i]
        newRotor.inverseWireTable[rotor.wiring[i]] = char
      })

      return newRotor
    })
  }

  createReflectorTable = function (this: Machine) {
    this.reflector.wireTable = {}
    this.reflector.inverseWireTable = {}

    ALPHA.forEach((char, i) => {
      this.reflector.wireTable[char] = this.reflector.wiring[i]
      this.reflector.inverseWireTable[this.reflector.wiring[i]] = char
    })
  }

  turnRotor = function (this: Machine, rotorIndex: number) {
    const newWireTable = {}
    const rotor = this.rotors[rotorIndex]

    ALPHA.forEach((char, i) => {
      newWireTable[char] = rotor.wireTable[ALPHA[(i + 1) % ALPHA.length]]
    })

    rotor.wireTable = newWireTable

    ALPHA.forEach((char) => {
      rotor.inverseWireTable[rotor.wireTable[char]] = char
    })

    rotor.position = (rotor.position + 1) % ALPHA.length
  }

  encodeChar = function (this: Machine, char: string) {
    let isLowercase = false

    if (char == char.toLowerCase()) {
      char.toUpperCase()
      isLowercase = true
    }

    char = char.toUpperCase()

    if (!ALPHA.includes(char)) return char

    this.turnRotor(0)

    if (this.rotors[0].position === ALPHA.indexOf(this.rotors[0].notch)) {
      this.turnRotor(1)
    }

    if (this.rotors[1].position === ALPHA.indexOf(this.rotors[1].notch)) {
      this.turnRotor(1)
      this.turnRotor(2)
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

    return isLowercase ? char.toLowerCase() : char
  }

  encodeString = function (this: Machine, string: string) {
    return string
      .split('')
      .map((char) => this.encodeChar(char))
      .join('')
  }

  exportTransformationLog = function (this: Machine): Log {
    return this.transformationLog
  }

  exportMachineState = function (this: Machine): MachineState {
    return {
      plugboard: this.plugboard,
      rotors: this.rotors,
      reflector: this.reflector,
    }
  }
}
