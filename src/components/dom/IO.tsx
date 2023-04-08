import { useState } from 'react'

export default function IO({
  plugboardState,
  plainText,
  cipherText,
  onTextAreaChange,
  currentPressedKey,
  setCurrentPressedKey,
}) {
  console.log('RENDERING IO')

  const onTextAreaKeyDown = (e) => {
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
    <div className='flex align-center justify-center border-y w-full border-gray-600 relative'>
      <textarea
        onChange={(e) => onTextAreaChange(e)}
        onKeyDown={(e) => onTextAreaKeyDown(e)}
        onKeyUp={(e) => onTextAreaKeyUp(e)}
        value={plainText}
        placeholder='Type a Message here'
        className='bg-transparent leading-[3.5rem] whitespace-pre-wrap w-full p-20 h-auto max-w-screen-sm uppercase text-gray-50 focus:border-none focus:outline-none text-lg font-mono resize-none'
      />
      <div className='break-words	pointer-events-none leading-[3.5rem] top-[1.5rem] text-gray-500 whitespace-pre-wrap	absolute w-full p-20 h-auto max-w-screen-sm uppercase focus:border-none focus:outline-none text-lg font-mono'>
        {cipherText}
      </div>
    </div>
  )
}
