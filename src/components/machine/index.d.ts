interface WireTable {
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

interface Rotor {
  name: string
  wiring: string
  notch: string
  position: number
  offset: number
  wireTable?: WireTable
  inverseWireTable?: WireTable
}

interface Log {
  plugboard: LogItem
  rotors: LogItem[]
  reflector: {
    enter: string
    exit: string
  }
}

interface LogItem {
  forwards: {
    enter: string
    exit: string
  }
  backwards: {
    enter: string
    exit: string
  }
}

interface Reflector {
  name: string
  wiring: string
  wireTable?: WireTable
  inverseWireTable?: WireTable
}

interface MachineState {
  plugboard: WireTable
  rotors: Rotor[]
  reflector: Reflector
  transformationLog?: Log
}
