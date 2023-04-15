import { useRef } from 'react'

export default function Layout({ children }) {
  const localRef = useRef()

  return <div ref={localRef}>{children}</div>
}
