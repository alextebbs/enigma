import { KeyboardLayout } from '@/_globals'
import { useEffect, useState } from 'react'

export default function PlugboardKey(props) {
  return (
    <span
      data-key={props.char}
      onClick={(e) => props.onPlugboardKeyClick(e)}
      className={`plugboardKey hover:cursor-pointer inline-block px-3 mx-2 py-2 pb-3 rounded-sm lowercase border font-mono ${
        props.active ? 'text-white border-white' : 'text-green-500 border-green-500'
      }`}>
      {props.char.toLowerCase()}
      <div
        className={`rounded-full w-3 h-3 border-2 mt-2 ${
          props.active ? 'bg-white border-white' : 'border-green-500'
        }`}></div>
    </span>
  )
}
