import { keyboardLayout } from '@/_globals'
import { useRef, useEffect, useState, forwardRef } from 'react'

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'tailwind.config.js'

const fullConfig = resolveConfig(tailwindConfig)

type Point = [x: number, y: number]

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
  pressed: boolean
  working: boolean
  isEditing: boolean
  onPlugboardKeyClick: Function
  onPlugboardKeyMouseEnter: Function
  onPlugboardKeyMouseLeave: Function
}

const PlugboardKey = forwardRef<HTMLDivElement, PlugboardKeyProps>(
  function PlugboardKey(
    {
      char,
      active,
      hovered,
      pressed,
      working,
      isEditing,
      onPlugboardKeyClick,
      onPlugboardKeyMouseEnter,
      onPlugboardKeyMouseLeave,
    },
    ref,
  ) {
    let keyStateClasses = 'text-green-500 border-green-500'
    let dotStateClasses = 'border-green-500'

    if (hovered) {
      keyStateClasses = 'text-green-300 border-green-300'
      dotStateClasses = 'border-green-300'
    }

    if (active) {
      keyStateClasses = 'text-white border-white'
      dotStateClasses = 'bg-white border-white'
    }

    if (active && hovered) {
      if (isEditing) {
        keyStateClasses = 'text-white border-white hover:cursor-not-allowed'
        dotStateClasses = 'bg-white border-white'
      } else {
        keyStateClasses = 'text-blue-400 border-blue-400'
        dotStateClasses = 'bg-blue-400 border-blue-400'
      }
    }

    if (hovered && working) {
      keyStateClasses = 'text-red-500 border-red-500 hover:cursor-not-allowed'
      dotStateClasses = 'bg-red-500 border-red-500'
    }

    if (pressed) {
      keyStateClasses = 'text-yellow-300 border-yellow-300'
      dotStateClasses = 'bg-yellow-300 border-yellow-300'
    }

    return (
      <span
        ref={ref}
        data-key={char}
        onClick={(e) => onPlugboardKeyClick(e)}
        onMouseEnter={(e) => onPlugboardKeyMouseEnter(e)}
        onMouseLeave={(e) => onPlugboardKeyMouseLeave(e)}
        className={`plugboardKey cursor-pointer inline-block px-3 mx-1 py-2 pb-3 rounded-lg uppercase font-bold border ${keyStateClasses}`}>
        {char.toLowerCase()}
        <div
          className={`rounded-full w-3 h-3 border-2 mt-2 ${dotStateClasses}`}></div>
      </span>
    )
  },
)

export default function Plugboard({
  plugboardState,
  setPlugboardState,
  currentPressedKey,
}) {
  console.log('RENDERING PLUGBOARD')

  const [workingKey, setWorkingKey] = useState('')
  const [hoveredKey, setHoveredKey] = useState('')

  const isEditing = useRef(false)
  const workingBezierStart = useRef(null)
  const canvasRect = useRef(null)

  const plugboard = useRef(null)
  const canvas = useRef(null)
  const workingCanvas = useRef(null)

  useEffect(() => {
    console.log('doing useeffect things')
    ;[canvas.current, workingCanvas.current].forEach((el) => {
      el.style.width = '100%'
      el.style.height = '100%'
      el.width = el.offsetWidth
      el.height = el.offsetHeight
    })

    canvasRect.current = workingCanvas.current.getBoundingClientRect()

    drawPlugboardState(plugboardState)
  })

  const clearWorkingCanvas = () => {
    const ctx = workingCanvas.current.getContext('2d')
    ctx.clearRect(
      0,
      0,
      workingCanvas.current.width,
      workingCanvas.current.height,
    )
  }

  const drawPlugboardState = (plugboardState) => {
    const uniquePairs = getUniquePairings(plugboardState)

    console.log('rendering plugboard state')

    Object.entries(uniquePairs).forEach((item) => {
      const startEl = document.querySelector(
        `[data-key="${item[0]}"]`,
      ) as HTMLElement
      const endEl = document.querySelector(
        `[data-key="${item[1]}"]`,
      ) as HTMLElement

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

      let color

      if (
        startEl.dataset.key == currentPressedKey ||
        endEl.dataset.key == currentPressedKey
      ) {
        color = fullConfig.theme.colors.yellow[300]
      } else if (
        (startEl.dataset.key == hoveredKey ||
          endEl.dataset.key == hoveredKey) &&
        !isEditing.current
      ) {
        color = fullConfig.theme.colors.blue[400]
      } else {
        color = 'white'
      }

      drawBezier(canvas.current.getContext('2d'), bezierStart, bezierEnd, color)
    })
  }

  const drawBezier = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    color: string,
  ) => {
    // const distanceOffset = (1 / getDistance(...start, ...end)) * 500
    const distanceOffset = 50
    const mid: Point = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + distanceOffset,
    ]
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

      if (
        thisKey.dataset.key == workingKey ||
        thisKey.dataset.key in plugboardState
      ) {
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

      isEditing.current = false

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

    let color = 'white'

    if (workingKey == hoveredKey) {
      color = fullConfig.theme.colors.red[500]
    }

    drawBezier(
      workingCanvas.current.getContext('2d'),
      workingBezierStart.current,
      [e.clientX - canvasRect.current.left, e.clientY - canvasRect.current.top],
      color,
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

        <div
          id='plugboard'
          ref={plugboard}
          onMouseMove={(e) => onPlugboardMouseMove(e)}
          className='p-20 pt-10'>
          <div className='uppercase tracking-[.25em] text-xs text-center text-zinc-400 pb-1'>
            Plugboard
          </div>
          <div className='text-xs text-center text-zinc-400 pb-10'>
            Click on letters to connect them with wires.
          </div>
          {keyboardLayout.map((row) => {
            return (
              <div className='text-center mb-2' key={row}>
                {row.split('').map((char) => {
                  return (
                    <PlugboardKey
                      key={char}
                      char={char}
                      active={
                        char in plugboardState || workingKey === char
                          ? true
                          : false
                      }
                      working={workingKey === char}
                      hovered={
                        hoveredKey === char ||
                        plugboardState[char] === hoveredKey
                      }
                      pressed={
                        currentPressedKey === char ||
                        plugboardState[char] === currentPressedKey
                      }
                      isEditing={isEditing.current}
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
