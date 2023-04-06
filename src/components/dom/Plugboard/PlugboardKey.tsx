import { KeyboardLayout } from '@/_globals'
import { useEffect, useState } from 'react'

export default function PlugboardKey(props) {
  return (
    <span
      key={props.char}
      data-key={props.char}
      onClick={(e) => props.handlePlugboardClick(e)}
      onMouseEnter={(e) => props.handlePlugboardMouseEnter(e)}
      className='plugboardKey inline-block px-3 mx-2 py-2 pb-3 rounded-sm lowercase border font-mono text-green-500 border-green-500 hover:cursor-pointer'>
      {props.char.toLowerCase()}
      <div className='rounded-full w-3 h-3 border-2 border-green-500 mt-2'></div>
    </span>
  )
}
