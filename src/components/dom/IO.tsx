export default function IO({
  plainText,
  cipherText,
  onTextAreaChange,
  setCurrentPressedKey,
}) {
  const onTextAreaKeyDown = (e) => {
    // Kill repeated key presses so you can hold a key down and see the visualization without AAAAAAAAAAAAAAAAaa
    if (e.repeat == true && e.key !== 'Backspace' && e.key !== 'Delete') {
      e.preventDefault()
      return
    }

    // Check if e.keyCode is a single letter
    if (e.keyCode >= 65 && e.keyCode <= 90) {
      setCurrentPressedKey(e.key.toUpperCase())
    }
  }

  const onTextAreaKeyUp = (e) => {
    setCurrentPressedKey('')
  }

  let missingLastLetter = plainText
  missingLastLetter = missingLastLetter.split('')
  let lastLetter = missingLastLetter.splice(-1)

  let cipherMissingLastLetter = cipherText
  cipherMissingLastLetter = cipherMissingLastLetter.split('')
  let cipherLastLetter = cipherMissingLastLetter.splice(-1)

  return (
    <div className='border-b border-gray-600'>
      <div className='align-center relative flex w-full justify-center'>
        <textarea
          onChange={(e) => onTextAreaChange(e)}
          onKeyDown={(e) => onTextAreaKeyDown(e)}
          onKeyUp={(e) => onTextAreaKeyUp(e)}
          value={plainText}
          placeholder='Type a Message here'
          className='h-auto w-full max-w-screen-sm resize-none whitespace-pre-wrap bg-transparent p-20 text-sm uppercase leading-[3rem] text-gray-50 focus:border-none focus:outline-none'
        />
        <div className='pointer-events-none	absolute h-auto w-full	max-w-screen-sm whitespace-pre-wrap break-words p-20 text-sm uppercase leading-[3rem] focus:border-none focus:outline-none'>
          <span className='text-transparent'>{missingLastLetter}</span>
          <span className='text-yellow-500'>{lastLetter}</span>
        </div>
        <div className='pointer-events-none	absolute top-[1.25rem] h-auto w-full max-w-screen-sm	whitespace-pre-wrap break-words p-20 text-sm uppercase leading-[3rem] text-gray-500 focus:border-none focus:outline-none'>
          {cipherMissingLastLetter}
          <span className='text-pink-500'>{cipherLastLetter}</span>
        </div>
      </div>
      <div className='align-center mb-5 flex justify-center'>
        <button
          className='border-b text-sm uppercase'
          onClick={(e) => navigator.clipboard.writeText(cipherText)}>
          Copy to clipboard
        </button>
      </div>
    </div>
  )
}
