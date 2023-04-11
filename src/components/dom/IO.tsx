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

  return (
    <div className='border-b border-gray-600'>
      <div className='flex align-center justify-center w-full relative'>
        <textarea
          onChange={(e) => onTextAreaChange(e)}
          onKeyDown={(e) => onTextAreaKeyDown(e)}
          onKeyUp={(e) => onTextAreaKeyUp(e)}
          value={plainText}
          placeholder='Type a Message here'
          className='bg-transparent leading-[3rem] whitespace-pre-wrap w-full p-20 h-auto max-w-screen-sm uppercase text-gray-50 focus:border-none focus:outline-none resize-none text-sm'
        />
        <div className='break-words	pointer-events-none leading-[3rem] top-[1.25rem] text-gray-500 whitespace-pre-wrap	absolute w-full p-20 h-auto max-w-screen-sm uppercase focus:border-none focus:outline-none text-sm'>
          {cipherText}
        </div>
      </div>
      <div className='align-center flex justify-center mb-5'>
        <button
          className='text-sm uppercase border-b'
          onClick={(e) => navigator.clipboard.writeText(cipherText)}>
          Copy to clipboard
        </button>
      </div>
    </div>
  )
}
