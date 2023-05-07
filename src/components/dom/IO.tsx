import { useRef, useEffect } from 'react'

/**
 * Split a string into 3 parts, part one is everything leading up to the last
 * alphabetic character, part two is the last alphabetic character, and part
 * three is everything after the last alphabetic character. We need this for
 * some CSS black magic that we are going to do later.
 *
 * @param string The string to split
 */
function splitString(str: string) {
  const lastAlphaIndex = str.search(/[a-zA-Z](?=[^a-zA-Z]*$)/)
  if (lastAlphaIndex === -1) return [str, '', '']
  const part1 = str.slice(0, lastAlphaIndex)
  const part2 = str[lastAlphaIndex]
  const part3 = str.slice(lastAlphaIndex + 1)
  return [part1, part2, part3]
}

// QUESTION: What is the right way to give types to these props?
export default function IO({ plainText, cipherText, onTextAreaChange }) {
  const plainTextSizerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // When the textarea changes, resize the textarea match the sizer div
  useEffect(() => {
    const textarea = textareaRef.current
    const sizer = plainTextSizerRef.current

    if (textarea && sizer)
      textarea.style.height = sizer.getBoundingClientRect().height + 'px'
  })

  // Kill repeated key presses so you can hold a key down and see the visualization without AAAAAAAAAAAAAAAAaa
  // QUESTION: Whats the difference between the KeyboardEvent type and the
  // React.KeyboardEvent type? When I don't import React's KeyboardEvent type,
  // where does the KeyboardEvent I'm using come from?
  const onTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.repeat == true && e.key !== 'Backspace' && e.key !== 'Delete')
      e.preventDefault()
  }

  let plainTextSplit = splitString(plainText)
  let cipherTextSplit = splitString(cipherText)

  return (
    <div className='relative flex w-full grow justify-center overflow-y-auto'>
      <textarea
        onChange={(e) => onTextAreaChange(e)}
        onKeyDown={(e) => onTextAreaKeyDown(e)}
        value={plainText}
        ref={textareaRef}
        placeholder='Type a Message here'
        className='absolute w-full max-w-screen-sm resize-none overflow-y-hidden whitespace-pre-wrap bg-transparent p-10 text-sm leading-[3rem] text-gray-50 focus:border-none focus:outline-none'
      />
      <div
        ref={plainTextSizerRef}
        className='pointer-events-none absolute w-full max-w-screen-sm whitespace-pre-wrap break-words p-10 text-sm leading-[3rem] focus:border-none focus:outline-none'>
        <span className='text-transparent'>{plainTextSplit[0]}</span>
        <span className='text-yellow-400'>{plainTextSplit[1]}</span>
        <span className='text-transparent'>{plainTextSplit[2]}</span>
      </div>
      <div className='pointer-events-none	absolute top-[1.25rem] w-full max-w-screen-sm whitespace-pre-wrap break-words p-10 text-sm leading-[3rem] text-gray-500 focus:border-none focus:outline-none'>
        <span className='text-gray-500'>{cipherTextSplit[0]}</span>
        <span className='text-pink-500'>{cipherTextSplit[1]}</span>
        <span className='text-gray-500'>{cipherTextSplit[2]}</span>
      </div>
    </div>
  )
}
