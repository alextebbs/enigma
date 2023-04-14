export default function PlugboardKey({
  char,
  workingKey,
  isEditing,
  plugboard,
  forwardsKey,
  backwardsKey,
  hoveredKey,
  onPlugboardKeyClick,
  onPlugboardKeyMouseEnter,
  onPlugboardKeyMouseLeave,
}) {
  const active = char in plugboard || workingKey === char
  const hovered = [hoveredKey, plugboard[hoveredKey]].includes(char)
  const working = workingKey == char
  const forwards =
    forwardsKey != null &&
    (forwardsKey == char || plugboard[char] == forwardsKey)
  const backwards =
    backwardsKey != null &&
    (backwardsKey == char || plugboard[char] == backwardsKey)

  // Tailwind, eh?

  let keyStateClasses = 'text-slate-500 border-slate-500'
  let dotStateClasses = 'border-slate-500'

  if (hovered) {
    keyStateClasses = 'text-slate-400 border-slate-400'
    dotStateClasses = 'border-slate-400'
  }

  if (active) {
    keyStateClasses = 'text-slate-300 border-slate-300'
    dotStateClasses = 'bg-white border-white'
  }

  if (active && hovered) {
    if (isEditing) {
      keyStateClasses =
        'text-slate-300 border-slate-300 hover:cursor-not-allowed'
      dotStateClasses = 'bg-slate-300 border-slate-300'
    } else {
      keyStateClasses = 'text-white border-white'
      dotStateClasses = 'bg-white border-white'
    }
  }

  if (hovered && working) {
    keyStateClasses = 'text-red-500 border-red-500 hover:cursor-not-allowed'
    dotStateClasses = 'bg-red-500 border-red-500'
  }

  if (forwards) {
    keyStateClasses = 'text-yellow-500 border-yellow-500'
    dotStateClasses = 'border-yellow-500'

    if (active) {
      dotStateClasses += ' bg-yellow-500'
    }
  }

  if (backwards) {
    keyStateClasses = 'text-pink-500 border-pink-500'
    dotStateClasses = 'border-pink-500'

    if (active) {
      dotStateClasses += ' bg-pink-500'
    }
  }

  if (backwards && forwards) {
    keyStateClasses = 'text-[#eb7e51] border-[#eb7e51]'
    dotStateClasses = 'bg-[#eb7e51] border-[#eb7e51]'
  }

  return (
    <span
      data-key={char}
      onClick={(e) => onPlugboardKeyClick(e)}
      onMouseEnter={(e) => onPlugboardKeyMouseEnter(e)}
      onMouseLeave={(e) => onPlugboardKeyMouseLeave(e)}
      className={`mx-1 inline-block cursor-pointer rounded-lg border px-3 py-2 pb-3 font-bold uppercase ${keyStateClasses}`}>
      {char.toLowerCase()}
      <div
        className={`mt-2 h-3 w-3 rounded-full border-2 ${dotStateClasses}`}></div>
    </span>
  )
}
