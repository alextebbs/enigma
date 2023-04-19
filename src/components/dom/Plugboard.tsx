import { KEYBOARD_LAYOUT } from '@/_globals'
import { useRef, useEffect, useState } from 'react'

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'tailwind.config.js'
import PlugboardKey from './PlugboardKey'

const {
  theme: { colors },
} = resolveConfig(tailwindConfig)

type Point = [x: number, y: number]

export const getUniquePairings = (plugboardState) => {
  const uniquePairs = {}

  for (const key in plugboardState) {
    const value = plugboardState[key]

    if (!(value in uniquePairs) || uniquePairs[value] !== key) {
      uniquePairs[key] = value
    }
  }

  return uniquePairs
}

/**
 * The plugboard allows specific character pairs to be swapped, and contains
 * the functionality for editing these character pairs.
 *
 * @param machineState The current state of the machine
 * @param setMachineState Function to update the machine's state
 * @param transformationLog The history of the machine's transformations
 *
 */
export default function Plugboard({
  machineState,
  setMachineState,
  transformationLog,
}) {
  const [workingKey, setWorkingKey] = useState('')
  const [hoveredKey, setHoveredKey] = useState('')

  const isEditing = useRef(false)
  const workingBezierStart = useRef<Point>(null)
  const canvasRect = useRef<DOMRect>(null)

  const canvas = useRef<HTMLCanvasElement>(null)
  const workingCanvas = useRef<HTMLCanvasElement>(null)

  let forwardsKey = null
  let backwardsKey = null

  if (transformationLog) {
    forwardsKey = transformationLog.plugboard.forwards.enter
    backwardsKey = transformationLog.plugboard.backwards.enter
  }

  useEffect(() => {
    ;[canvas.current, workingCanvas.current].forEach((el) => {
      el.style.width = '100%'
      el.style.height = '100%'
      el.width = el.offsetWidth
      el.height = el.offsetHeight
    })

    canvasRect.current = workingCanvas.current.getBoundingClientRect()

    drawPlugboardState(machineState.plugboard)
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

  const drawPlugboardState = (plugboard) => {
    const uniquePairs = getUniquePairings(plugboard)

    Object.entries(uniquePairs).forEach((item) => {
      const startEl = document.querySelector<HTMLElement>(
        `[data-key="${item[0]}"]`,
      )
      const endEl = document.querySelector<HTMLElement>(
        `[data-key="${item[1]}"]`,
      )

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
        (startEl.dataset.key == backwardsKey ||
          endEl.dataset.key == backwardsKey) &&
        (startEl.dataset.key == forwardsKey || endEl.dataset.key == forwardsKey)
      ) {
        color = '#eb7e51'
      } else if (
        startEl.dataset.key == forwardsKey ||
        endEl.dataset.key == forwardsKey
      ) {
        color = colors.yellow[500]
      } else if (
        startEl.dataset.key == backwardsKey ||
        endEl.dataset.key == backwardsKey
      ) {
        color = colors.pink[500]
      } else {
        color = colors.white
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

  const onPlugboardKeyClick = (e: React.MouseEvent<HTMLElement>) => {
    const thisKey = e.currentTarget

    if (isEditing.current) {
      isEditing.current = false

      if (
        thisKey.dataset.key == workingKey ||
        thisKey.dataset.key in machineState.plugboard
      ) {
        clearWorkingCanvas()
        setWorkingKey(null)
        return
      }

      setWorkingKey(null)

      const newPlugboardState = machineState.plugboard
      newPlugboardState[workingKey] = thisKey.dataset.key
      newPlugboardState[thisKey.dataset.key] = workingKey
      setMachineState({
        ...machineState,
        plugboard: newPlugboardState,
      })

      return
    }

    if (thisKey.dataset.key in machineState.plugboard) {
      isEditing.current = false
      const newPlugboardState = machineState.plugboard
      delete newPlugboardState[newPlugboardState[thisKey.dataset.key]]
      delete newPlugboardState[thisKey.dataset.key]
      setMachineState({
        ...machineState,
        plugboard: newPlugboardState,
      })
    }

    setWorkingKey(thisKey.dataset.key)

    const dotRect = thisKey.children[0].getBoundingClientRect()

    workingBezierStart.current = [
      dotRect.left - canvasRect.current.left + dotRect.width / 2,
      dotRect.top - canvasRect.current.top + dotRect.height / 2,
    ]

    isEditing.current = true
  }

  const onPlugboardMouseMove = (e: React.MouseEvent) => {
    if (!isEditing.current) return

    clearWorkingCanvas()

    let color = workingKey == hoveredKey ? colors.red[500] : 'white'

    drawBezier(
      workingCanvas.current.getContext('2d'),
      workingBezierStart.current,
      [e.clientX - canvasRect.current.left, e.clientY - canvasRect.current.top],
      color,
    )
  }

  const onPlugboardKeyMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const thisKey = e.currentTarget
    setHoveredKey(thisKey.dataset.key)
  }

  const onPlugboardKeyMouseLeave = () => {
    setHoveredKey(null)
  }

  const keyProps = {
    plugboard: machineState.plugboard,
    isEditing,
    onPlugboardKeyClick,
    onPlugboardKeyMouseEnter,
    onPlugboardKeyMouseLeave,
    forwardsKey,
    backwardsKey,
    hoveredKey,
    workingKey,
  }

  // TODO:

  return (
    <div className='flex justify-center'>
      <div className='relative'>
        <div className={`pointer-events-none absolute h-full w-full`}>
          <canvas ref={canvas} id='plugboardCanvas'></canvas>
        </div>
        <div className={`pointer-events-none absolute h-full w-full`}>
          <canvas ref={workingCanvas} id='plugboardWorkingCanvas'></canvas>
        </div>

        <div
          id='plugboard'
          onMouseMove={(e) => onPlugboardMouseMove(e)}
          className='p-10'>
          {KEYBOARD_LAYOUT.map((row) => (
            <div className='mb-2 text-center' key={row}>
              {row.split('').map((char) => (
                <PlugboardKey key={char} char={char} {...keyProps} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
