import { KEYBOARD_LAYOUT } from '@/_globals'
import { useRef, useEffect, useState } from 'react'

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'tailwind.config.js'
import PlugboardKey from './PlugboardKey'

const {
  theme: { colors },
} = resolveConfig(tailwindConfig)

type Point = [x: number, y: number]

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

/**
 * The plugboard component
 *
 * @param plugboardState The current state of the plugboard
 * @param setPlugboardState The function to update the plugboard state
 * @param currentPressedKey The current key that is being pressed
 *
 */
export default function Plugboard({
  machineState,
  setMachineState,
  currentPressedKey,
}) {
  const [workingKey, setWorkingKey] = useState('')
  const [hoveredKey, setHoveredKey] = useState('')

  const isEditing = useRef(false)
  const workingBezierStart = useRef(null)
  const canvasRect = useRef(null)

  const plugboard = useRef(null)
  const canvas = useRef(null)
  const workingCanvas = useRef(null)

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
        color = colors.yellow[300]
      } else if (
        (startEl.dataset.key == hoveredKey ||
          endEl.dataset.key == hoveredKey) &&
        !isEditing.current
      ) {
        color = colors.blue[400]
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

    if (isEditing.current) {
      isEditing.current = false

      if (
        thisKey.dataset.key == workingKey ||
        thisKey.dataset.key in machineState.plugboard
      ) {
        clearWorkingCanvas()
        setWorkingKey('')
        return
      }

      setWorkingKey('')

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

  const onPlugboardMouseMove = (e) => {
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
          {KEYBOARD_LAYOUT.map((row) => {
            return (
              <div className='text-center mb-2' key={row}>
                {row.split('').map((char) => {
                  return (
                    <PlugboardKey
                      key={char}
                      char={char}
                      active={
                        char in machineState.plugboard || workingKey === char
                          ? true
                          : false
                      }
                      working={workingKey === char}
                      hovered={
                        hoveredKey === char ||
                        machineState.plugboard[char] === hoveredKey
                      }
                      pressed={
                        currentPressedKey === char ||
                        machineState.plugboard[char] === currentPressedKey
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
