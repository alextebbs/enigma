import { useRef, useEffect, useState } from 'react'

import { BsCheckLg, BsClipboard } from 'react-icons/bs'

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
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement>
}

export const IO: React.FC<IOProps> = (props) => {
  const { plainText, cipherText, onTextAreaChange, textareaRef } = props

  const plainTextSizerRef = useRef<HTMLDivElement>(null)

  const [showingClipboardSuccess, setShowingClipboardSuccess] =
    useState<boolean>(false)

  const matchSize = () => {
    const textarea = textareaRef.current
    const sizer = plainTextSizerRef.current

    if (textarea && sizer)
      textarea.style.height = sizer.getBoundingClientRect().height + 'px'
  }

  // When the textarea changes, resize the textarea to match the sizer div
  useEffect(matchSize)

  const onTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == 'Enter') e.preventDefault()
  }

  const plainTextSplit = splitString(plainText)
  const cipherTextSplit = splitString(cipherText)

  return (
    <div className='relative flex w-full grow justify-center overflow-y-auto'>
      <div className='absolute w-full max-w-screen-sm resize-none bg-transparent text-sm leading-[3rem] text-gray-50'>
        <textarea
          className='min-h-0 w-full resize-none overflow-y-hidden whitespace-pre-wrap bg-transparent p-10 focus:border-none focus:outline-none'
          autoFocus
          onChange={(e) => {
            onTextAreaChange(e)
            matchSize()
          }}
          onKeyDown={(e) => onTextAreaKeyDown(e)}
          value={plainText}
          ref={textareaRef}
          placeholder='Type a message here...'
        />
        <div className='absolute bottom-0 left-10 z-40'>
          <button
            onClick={() => {
              setShowingClipboardSuccess(true)
              window.navigator.clipboard.writeText(cipherText)
            }}
            className={`flex overflow-hidden rounded-sm bg-slate-900 p-2 px-4 text-center text-xs uppercase tracking-[0.15em] text-slate-600 transition-all hover:bg-slate-700 hover:text-slate-200 ${
              cipherText ? `block` : `hidden`
            }`}>
            Copy Ciphertext
            <div className='relative ml-2'>
              <BsClipboard className='opacity-0' />
              <div
                onTransitionEnd={() => setShowingClipboardSuccess(false)}
                className={`absolute flex flex-col gap-3 transition-[top] ${
                  showingClipboardSuccess
                    ? `top-[-1.4rem]`
                    : `top-[0rem] delay-1000`
                }`}>
                <BsClipboard />
                <BsCheckLg />
              </div>
            </div>
          </button>
        </div>
      </div>
      <div
        ref={plainTextSizerRef}
        className='pointer-events-none absolute w-full max-w-screen-sm whitespace-pre-wrap break-words p-10 text-sm leading-[3rem] focus:border-none focus:outline-none'>
        <div>
          <span className='text-transparent'>{plainTextSplit[0]}</span>
          <span className='text-yellow-400'>{plainTextSplit[1]}</span>
          <span className='text-transparent'>{plainTextSplit[2]}</span>
        </div>
      </div>
      <div className='pointer-events-none	absolute top-[1.25rem] w-full max-w-screen-sm whitespace-pre-wrap break-words p-10 text-sm leading-[3rem] text-gray-500 focus:border-none focus:outline-none'>
        <span className='text-gray-500'>{cipherTextSplit[0]}</span>
        <span className='text-pink-500'>{cipherTextSplit[1]}</span>
        <span className='text-gray-500'>{cipherTextSplit[2]}</span>
      </div>
    </div>
  )
}
