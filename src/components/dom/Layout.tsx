import { useRef, forwardRef, useImperativeHandle } from 'react'

const Layout = forwardRef(({ children, ...props }, ref) => {
  const localRef = useRef()

  useImperativeHandle(ref, () => localRef.current)

  return (
    <div {...props} ref={localRef} className='bg-black text-gray-50'>
      {children}
    </div>
  )
})
Layout.displayName = 'Layout'

export default Layout
