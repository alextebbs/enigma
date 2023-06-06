export class WireTableClass {
  A: Letter = 'A'
  B: Letter = 'B'
  C: Letter = 'C'
  D: Letter = 'D'
  E: Letter = 'E'
  F: Letter = 'F'
  G: Letter = 'G'
  H: Letter = 'H'
  I: Letter = 'I'
  J: Letter = 'J'
  K: Letter = 'K'
  L: Letter = 'L'
  M: Letter = 'M'
  N: Letter = 'N'
  O: Letter = 'O'
  P: Letter = 'P'
  Q: Letter = 'Q'
  R: Letter = 'R'
  S: Letter = 'S'
  T: Letter = 'T'
  U: Letter = 'U'
  V: Letter = 'V'
  W: Letter = 'W'
  X: Letter = 'X'
  Y: Letter = 'Y'
  Z: Letter = 'Z'
}

export interface WireTable extends WireTableClass {}

export type Letter = keyof WireTable

export type Letters = Array<Letter>

// Blah, this didn't work right because WireTable makes the keys optional so
// this array is empty
export const ALPHA: Letters = Object.keys(new WireTableClass()) as Letters

export interface Rotor {
  name: string
  wiring: string
  notch: Letter
  position: number
  offset: number
  wireTable: WireTable
  inverseWireTable: WireTable
}

export interface Log {
  plugboard: BidirectionalLogEntry
  rotors: BidirectionalLogEntry[]
  reflector: LogEntry
}

export interface BidirectionalLogEntry {
  forwards: LogEntry
  backwards: LogEntry
}

export interface LogEntry {
  enter: Letter | null
  exit: Letter | null
}

export interface Reflector {
  name: string
  wiring: string
  wireTable: WireTable
  inverseWireTable: WireTable
}

export interface MachineState {
  plugboard: Partial<WireTable>
  rotors: Rotor[]
  reflector: Reflector
  transformationLog?: Log
}

export class Machine {
  plugboard: Partial<WireTable>
  rotors: Rotor[]
  reflector: Reflector
  transformationLog: Log

  constructor({ plugboard, rotors, reflector }: MachineState) {
    this.plugboard = plugboard
    this.rotors = rotors
    this.reflector = reflector

    this.createReflectorTable()
    this.createRotorWiringTables()

    this.transformationLog = {
      reflector: { enter: null, exit: null },
      plugboard: {
        forwards: { enter: null, exit: null },
        backwards: { enter: null, exit: null },
      },
      rotors: this.rotors.map((_) => {
        return {
          forwards: { enter: null, exit: null },
          backwards: { enter: null, exit: null },
        }
      }),
    }
  }

  createRotorWiringTables = function (this: Machine) {
    this.rotors = this.rotors.map((rotor: Rotor) => {
      let newRotor = { ...rotor }

      newRotor.wireTable = new WireTableClass()
      newRotor.inverseWireTable = new WireTableClass()

      ALPHA.forEach((char, i) => {
        const letter = rotor.wiring[i] as Letter
        newRotor.wireTable[char] = letter
        newRotor.inverseWireTable[letter] = char
      })

      return newRotor
    })
  }

  createReflectorTable = function (this: Machine) {
    this.reflector.wireTable = new WireTableClass()
    this.reflector.inverseWireTable = new WireTableClass()

    ALPHA.forEach((char, i) => {
      const letter = this.reflector.wiring[i] as Letter

      this.reflector.wireTable[char] = letter
      this.reflector.inverseWireTable[letter] = char
    })
  }

  turnRotor = function (this: Machine, rotorIndex: number) {
    const newWireTable = new WireTableClass()
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

  encodeChar = function (this: Machine, initialChar: string) {
    let isLowercase = false

    if (initialChar == initialChar.toLowerCase()) {
      isLowercase = true
    }

    let char = initialChar.toUpperCase() as Letter

    if (!ALPHA.includes(char)) return char

    this.turnRotor(0)

    if (this.rotors[0].position === ALPHA.indexOf(this.rotors[0].notch)) {
      this.turnRotor(1)
    }

    if (this.rotors[1].position === ALPHA.indexOf(this.rotors[1].notch)) {
      this.turnRotor(1)
      this.turnRotor(2)
    }

    this.transformationLog.plugboard.forwards.enter = char as Letter
    char = this.plugboard[char as Letter] || char
    this.transformationLog.plugboard.forwards.exit = char as Letter

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

    return isLowercase ? (char.toLowerCase() as string) : (char as string)
  }

  encodeString = function (this: Machine, string: string) {
    return string
      .split('')
      .map((char) => this.encodeChar(char))
      .join('')
  }

  exportTransformationLog = function (this: Machine) {
    return this.transformationLog
  }

  exportMachineState = function (this: Machine): MachineState {
    return {
      plugboard: this.plugboard,
      rotors: this.rotors,
      reflector: this.reflector,
      transformationLog: this.transformationLog,
    }
  }
}
