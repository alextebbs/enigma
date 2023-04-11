import { forwardRef } from 'react'

interface PlugboardKeyProps {
  active: boolean
  char: string
  hovered: boolean
  pressed: boolean
  working: boolean
  isEditing: boolean
  onPlugboardKeyClick: Function
  onPlugboardKeyMouseEnter: Function
  onPlugboardKeyMouseLeave: Function
}

const PlugboardKey = forwardRef<HTMLDivElement, PlugboardKeyProps>(
  function PlugboardKey(
    {
      char,
      active,
      hovered,
      pressed,
      working,
      isEditing,
      onPlugboardKeyClick,
      onPlugboardKeyMouseEnter,
      onPlugboardKeyMouseLeave,
    },
    ref,
  ) {
    let keyStateClasses = 'text-green-500 border-green-500'
    let dotStateClasses = 'border-green-500'

    if (hovered) {
      keyStateClasses = 'text-green-300 border-green-300'
      dotStateClasses = 'border-green-300'
    }

    if (active) {
      keyStateClasses = 'text-white border-white'
      dotStateClasses = 'bg-white border-white'
    }

    if (active && hovered) {
      if (isEditing) {
        keyStateClasses = 'text-white border-white hover:cursor-not-allowed'
        dotStateClasses = 'bg-white border-white'
      } else {
        keyStateClasses = 'text-blue-400 border-blue-400'
        dotStateClasses = 'bg-blue-400 border-blue-400'
      }
    }

    if (hovered && working) {
      keyStateClasses = 'text-red-500 border-red-500 hover:cursor-not-allowed'
      dotStateClasses = 'bg-red-500 border-red-500'
    }

    if (pressed) {
      keyStateClasses = 'text-yellow-300 border-yellow-300'
      dotStateClasses = 'bg-yellow-300 border-yellow-300'
    }

    return (
      <span
        ref={ref}
        data-key={char}
        onClick={(e) => onPlugboardKeyClick(e)}
        onMouseEnter={(e) => onPlugboardKeyMouseEnter(e)}
        onMouseLeave={(e) => onPlugboardKeyMouseLeave(e)}
        className={`plugboardKey cursor-pointer inline-block px-3 mx-1 py-2 pb-3 rounded-lg uppercase font-bold border ${keyStateClasses}`}>
        {char.toLowerCase()}
        <div
          className={`rounded-full w-3 h-3 border-2 mt-2 ${dotStateClasses}`}></div>
      </span>
    )
  },
)

export default PlugboardKey
