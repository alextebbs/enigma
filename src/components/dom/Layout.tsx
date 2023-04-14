import { useRef } from 'react'

export default function Layout({ children }) {
  const localRef = useRef()

  return (
    <div ref={localRef} className='bg-black text-gray-50'>
      {children}
    </div>
  )
}
