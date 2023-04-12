export const KEYBOARD_LAYOUT = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML']

export const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const availableRotors = [
  {
    name: 'I',
    wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
    notch: 'R',
    position: 0,
    offset: 0,
  },
  {
    name: 'II',
    wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE',
    notch: 'F',
    position: 0,
    offset: 0,
  },
  {
    name: 'III',
    wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO',
    notch: 'W',
    position: 0,
    offset: 0,
  },
  {
    name: 'IV',
    wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB',
    notch: 'K',
    position: 0,
    offset: 0,
  },
  {
    name: 'V',
    wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK',
    notch: 'A',
    position: 0,
    offset: 0,
  },
]

export const initialRotors = [
  availableRotors[2],
  availableRotors[1],
  availableRotors[0],
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

export const initialReflector = availableReflectors[1]
