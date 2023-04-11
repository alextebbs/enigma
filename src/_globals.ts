export const KEYBOARD_LAYOUT = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML']

export const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const availableRotors = [
  {
    name: 'I',
    wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    notch: 'Q',
    position: 0,
    offset: 0,
  },
  {
    name: 'II',
    wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    notch: 'E',
    position: 0,
    offset: 0,
  },
  {
    name: 'III',
    wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    notch: 'V',
    position: 0,
    offset: 0,
  },
  {
    name: 'IV',
    wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    notch: 'J',
    position: 0,
    offset: 0,
  },
  {
    name: 'V',
    wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK',
    notch: 'Z',
    position: 0,
    offset: 0,
  },
]

export const initialRotors = [
  availableRotors[0],
  availableRotors[1],
  availableRotors[2],
]

export const availableReflectors = [
  {
    name: 'UKW-A',
    wiring: 'EJMZALYXVBWFCRQUONTSPIKHGD',
  },
  {
    name: 'UKW-B',
    wiring: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  },
  {
    name: 'UKW-C',
    wiring: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
  },
]

export const initialReflector = availableReflectors[0]
