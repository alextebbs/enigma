import { useRef, useEffect } from 'react'

/**
 * Split a string into 3 parts, part one is everything leading up to the last
 * alphabetic character, part two is the last alphabetic character, and part
 * three is everything after the last alphabetic character. We need this for
 * some CSS black magic that we are going to do later.
 *
 * @param {string} str The string to split
 * @returns {string[]} An array of 3 strings representing the split parts
 */
function splitString(str: string): string[] {
  const lastAlphaIndex = str.search(/[a-zA-Z](?=[^a-zA-Z]*$)/)
  if (lastAlphaIndex === -1) return [str, '', '']
  const part1 = str.slice(0, lastAlphaIndex)
  const part2 = str[lastAlphaIndex]
  const part3 = str.slice(lastAlphaIndex + 1)
  return [part1, part2, part3]
}

interface IOProps {
  plainText: string
  cipherText: string
  onTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement>
}

export const IO: React.FC<IOProps> = (props) => {
  const { plainText, cipherText, onTextAreaChange } = props

  const plainTextSizerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // When the textarea changes, resize the textarea match the sizer div
  useEffect(() => {
    const textarea = textareaRef.current
    const sizer = plainTextSizerRef.current

    if (textarea && sizer)
      textarea.style.height = sizer.getBoundingClientRect().height + 'px'
  })

  // I don't actually think I need any of this anymore, I don't want to kill
  // repeated key presses.
  const onTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.repeat == true && e.key !== 'Backspace' && e.key !== 'Delete')
      e.preventDefault()
  }

  const plainTextSplit = splitString(plainText)
  const cipherTextSplit = splitString(cipherText)

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
