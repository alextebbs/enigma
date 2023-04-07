import { KeyboardLayout } from '@/_globals'
import { useRef, useEffect, useState, forwardRef } from 'react'

type Point = [x: number, y: number]

/*
  TODO: 1. Draw the canvas dynamically, ie - make a new canvas for each event click
        2. Deal with removing items
        3. Hovering over an active item should highlight it's partner
*/

const getDistance = (x1, y1, x2, y2) => {
  let y = x2 - x1
  let x = y2 - y1
  return Math.sqrt(x * x + y * y)
}

const getUniquePairings = (plugboardState) => {
  const uniquePairs = {}

  for (const key in plugboardState) {
    const value = plugboardState[key]

    if (!(value in uniquePairs) || uniquePairs[value] !== key) {
      uniquePairs[key] = value
    }
  }

  return uniquePairs
}

interface PlugboardKeyProps {
  active: boolean
  char: string
  hovered: boolean
  onPlugboardKeyClick: Function
  onPlugboardKeyMouseEnter: Function
  onPlugboardKeyMouseLeave: Function
}

const PlugboardKey = forwardRef<HTMLDivElement, PlugboardKeyProps>(function PlugboardKey(
  { active, char, hovered, onPlugboardKeyClick, onPlugboardKeyMouseEnter, onPlugboardKeyMouseLeave },
  ref,
) {
  let keyStateClasses = 'text-green-500 border-green-500'
  let dotStateClasses = 'border-green-500'

  if (hovered) {
    keyStateClasses = 'text-blue-500 border-blue-500'
    dotStateClasses = 'border-blue-500'
  }
  if (active) {
    keyStateClasses = 'text-white border-white'
    dotStateClasses = 'bg-white border-white'
  }
  if (active && hovered) {
    keyStateClasses = 'text-red-500 border-red-500'
    dotStateClasses = 'bg-red-500 border-red-500'
  }

  return (
    <span
      ref={ref}
      data-key={char}
      onClick={(e) => onPlugboardKeyClick(e)}
      onMouseEnter={(e) => onPlugboardKeyMouseEnter(e)}
      onMouseLeave={(e) => onPlugboardKeyMouseLeave(e)}
      className={`plugboardKey hover:cursor-pointer inline-block px-3 mx-2 py-2 pb-3 rounded-lg uppercase font-bold border font-mono ${keyStateClasses}`}>
      {char.toLowerCase()}
      <div className={`rounded-full w-3 h-3 border-2 mt-2 ${dotStateClasses}`}></div>
    </span>
  )
})

export default function Plugboard() {
  console.log('RENDERING')

  const [plugboardState, setPlugboardState] = useState({})
  const [workingKey, setWorkingKey] = useState('')
  const [hoveredKey, setHoveredKey] = useState('')

  const isEditing = useRef(false)
  const workingBezierStart = useRef(null)
  const canvasRect = useRef(null)

  const keysRef = useRef(null)

  // const workingKey = useRef('')

  const plugboard = useRef(null)
  const canvas = useRef(null)
  const workingCanvas = useRef(null)

  function getMap() {
    if (!keysRef.current) {
      // initialize the Map on first usage.
      keysRef.current = new Map()
    }
    return keysRef.current
  }

  useEffect(
    () => {
      console.log('doing useeffect things')
      ;[canvas.current, workingCanvas.current].forEach((el) => {
        el.style.width = '100%'
        el.style.height = '100%'
        el.width = el.offsetWidth
        el.height = el.offsetHeight
      })

      canvasRect.current = workingCanvas.current.getBoundingClientRect()

      drawPlugboardState(plugboardState)
    } /* Why does this not work? [plugboardState] */,
  )

  const clearWorkingCanvas = () => {
    const ctx = workingCanvas.current.getContext('2d')
    ctx.clearRect(0, 0, workingCanvas.current.width, workingCanvas.current.height)
  }

  const drawPlugboardState = (plugboardState) => {
    const uniquePairs = getUniquePairings(plugboardState)

    console.log('rendering plugboard state')

    Object.entries(uniquePairs).forEach((item) => {
      const startEl = document.querySelector(`[data-key="${item[0]}"]`) as HTMLElement
      const endEl = document.querySelector(`[data-key="${item[1]}"]`) as HTMLElement

      const startRect = startEl.children[0].getBoundingClientRect()
      const endRect = endEl.children[0].getBoundingClientRect()

      const cRect = canvas.current.getBoundingClientRect()

      const bezierStart: Point = [
        startRect.left - cRect.left + startRect.width / 2,
        startRect.top - cRect.top + startRect.height / 2,
      ]

      const bezierEnd: Point = [
        endRect.left - cRect.left + endRect.width / 2,
        endRect.top - cRect.top + endRect.height / 2,
      ]

      let color = startEl.dataset.key == hoveredKey || endEl.dataset.key == hoveredKey ? 'red' : 'white'

      drawBezier(canvas.current.getContext('2d'), bezierStart, bezierEnd, color)
    })
  }

  const drawBezier = (ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string) => {
    // const distanceOffset = (1 / getDistance(...start, ...end)) * 500
    const distanceOffset = 50
    const mid: Point = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + distanceOffset]
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(...start)
    ctx.quadraticCurveTo(...mid, ...end)
    ctx.stroke()
  }

  const onPlugboardKeyClick = (e: MouseEvent) => {
    const thisKey = e.currentTarget as HTMLElement

    console.log('clicked on', thisKey.dataset.key)

    if (isEditing.current) {
      isEditing.current = false

      if (thisKey.dataset.key == workingKey || thisKey.dataset.key in plugboardState) {
        clearWorkingCanvas()
        setWorkingKey('')
        return
      }

      setWorkingKey('')
      const newPlugboardState = plugboardState
      newPlugboardState[workingKey] = thisKey.dataset.key
      newPlugboardState[thisKey.dataset.key] = workingKey
      setPlugboardState(newPlugboardState)
      return
    }

    if (thisKey.dataset.key in plugboardState) {
      console.log('we clicked on something that was already set')

      const newPlugboardState = plugboardState
      delete newPlugboardState[newPlugboardState[thisKey.dataset.key]]
      delete newPlugboardState[thisKey.dataset.key]
      setPlugboardState(newPlugboardState)
    }

    setWorkingKey(thisKey.dataset.key)

    const dotRect = thisKey.children[0].getBoundingClientRect()

    workingBezierStart.current = [
      dotRect.left - canvasRect.current.left + dotRect.width / 2,
      dotRect.top - canvasRect.current.top + dotRect.height / 2,
    ]

    isEditing.current = true
  }

  const onPlugboardMouseMove = (e) => {
    if (!isEditing.current) return

    clearWorkingCanvas()

    drawBezier(
      workingCanvas.current.getContext('2d'),
      workingBezierStart.current,
      [e.clientX - canvasRect.current.left, e.clientY - canvasRect.current.top],
      'white',
    )
  }

  const onPlugboardKeyMouseEnter = (e) => {
    const thisKey = e.currentTarget as HTMLElement
    setHoveredKey(thisKey.dataset.key)
  }

  const onPlugboardKeyMouseLeave = (e) => {
    setHoveredKey('')
  }

  return (
    <div className='flex align-center justify-center'>
      <div className='relative'>
        <div className={`absolute w-full h-full pointer-events-none`}>
          <canvas ref={canvas} id='plugboardCanvas'></canvas>
        </div>
        <div className={`absolute w-full h-full pointer-events-none`}>
          <canvas ref={workingCanvas} id='plugboardWorkingCanvas'></canvas>
        </div>

        <div id='plugboard' ref={plugboard} onMouseMove={(e) => onPlugboardMouseMove(e)} className='p-20 pt-10'>
          <div className='font-mono uppercase tracking-[.25em] text-xs text-center text-zinc-400 pb-1'>Plugboard</div>
          <div className='font-mono text-xs text-center text-zinc-400 pb-10'>
            Click on letters to connect them with wires.
          </div>
          {KeyboardLayout.map((row) => {
            return (
              <div className='text-center mb-3' key={row}>
                {row.split('').map((char) => {
                  return (
                    <PlugboardKey
                      key={char}
                      ref={(node) => {
                        const map = getMap()
                        if (node) {
                          map.set(char, node)
                        } else {
                          map.delete(char)
                        }
                      }}
                      char={char}
                      active={char in plugboardState || workingKey === char ? true : false}
                      hovered={hoveredKey === char || plugboardState[char] === hoveredKey}
                      onPlugboardKeyClick={onPlugboardKeyClick}
                      onPlugboardKeyMouseEnter={onPlugboardKeyMouseEnter}
                      onPlugboardKeyMouseLeave={onPlugboardKeyMouseLeave}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
