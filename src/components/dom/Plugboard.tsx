import { KEYBOARD_LAYOUT } from '@/_globals'
import { useRef, useEffect, useState } from 'react'
import { PlugboardKey } from './PlugboardKey'
import { RecursiveKeyValuePair } from 'tailwindcss/types/config'
import {
  MachineState,
  Log,
  WireTable,
  Letter,
} from '@/components/machine/Machine'

// This is messsed up and makes a type error because I don't think tailwind
// is configured correctly. I'm not sure how to fix it.
//
// import resolveConfig from 'tailwindcss/resolveConfig'
// import tailwindConfig from 'tailwind.config'
// const {
//   theme: { colors },
// } = resolveConfig(tailwindConfig)
//
// So instead I'm just doing this
import { colors } from '@/_globals'

type Point = [x: number, y: number]
type Color = string | RecursiveKeyValuePair

/**
 * Given a wiring table state, return a new object that contains only the
 * unique pairs of characters.
 *
 * @param wireTable Wiring table to be processed
 */
export const getUniquePairings = (wireTable: Partial<WireTable>) => {
  return Object.entries(wireTable).reduce(
    (acc: Partial<WireTable>, [key, value]) => {
      if (!value) return acc

      if (!(value in acc) || acc[value as Letter] !== key) {
        acc[key as Letter] = value
      }

      return acc
    },
    {},
  ) as Partial<WireTable>
}

interface PlugboardProps {
  machineState: MachineState
  setMachineState: React.Dispatch<React.SetStateAction<MachineState>>
  transformationLog: Log | null
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
export const Plugboard: React.FC<PlugboardProps> = (props) => {
  const { machineState, setMachineState, transformationLog } = props

  const [workingKey, setWorkingKey] = useState<Letter | null>(null)
  const [hoveredKey, setHoveredKey] = useState<Letter | null>(null)

  const isEditing = useRef<boolean>(false)
  const workingBezierStart = useRef<Point | null>(null)
  const canvasRect = useRef<DOMRect | undefined>(undefined)

  const canvas = useRef<HTMLCanvasElement | null>(null)
  const workingCanvas = useRef<HTMLCanvasElement | null>(null)

  let forwardsKey: Letter | null = null
  let backwardsKey: Letter | null = null

  if (transformationLog) {
    forwardsKey = transformationLog.plugboard.forwards?.enter ?? null
    backwardsKey = transformationLog.plugboard.backwards?.enter ?? null
  }

  useEffect(() => {
    ;[canvas.current, workingCanvas.current].forEach((el) => {
      if (!el) return

      el.style.width = '100%'
      el.style.height = '100%'
      el.width = el.offsetWidth
      el.height = el.offsetHeight
    })

    // QUESTION: Strict mode tells me I can't assign to current... can I not
    // modify the ref like this? Do I need to call useRef again?
    canvasRect.current = workingCanvas?.current?.getBoundingClientRect()

    drawPlugboardState(machineState.plugboard)
  })

  const clearWorkingCanvas = () => {
    if (!workingCanvas.current) return

    const ctx = workingCanvas.current.getContext('2d')

    ctx?.clearRect(
      0,
      0,
      workingCanvas.current.width,
      workingCanvas.current.height,
    )
  }

  const drawPlugboardState = (plugboard: Partial<WireTable>) => {
    const uniquePairs = getUniquePairings(plugboard)

    Object.entries(uniquePairs).forEach((item) => {
      // QUESTION: This is not react-y, whats the right way to do it otherwise?
      // Something with ref callbacks?
      const startEl = document.querySelector<HTMLElement>(
        `[data-key="${item[0]}"]`,
      )
      const endEl = document.querySelector<HTMLElement>(
        `[data-key="${item[1]}"]`,
      )

      if (!startEl || !endEl) {
        console.log("Couldn't find key element")
        return
      }

      const startRect = startEl.children[0].getBoundingClientRect()
      const endRect = endEl.children[0].getBoundingClientRect()

      if (!canvas.current) {
        console.log("Couldn't find canvas")
        return
      }

      const cRect = canvas.current.getBoundingClientRect()

      const bezierStart: Point = [
        startRect.left - cRect.left + startRect.width / 2,
        startRect.top - cRect.top + startRect.height / 2,
      ]

      const bezierEnd: Point = [
        endRect.left - cRect.left + endRect.width / 2,
        endRect.top - cRect.top + endRect.height / 2,
      ]

      let color: Color

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
    ctx: CanvasRenderingContext2D | null,
    start: Point,
    end: Point,
    color: Color,
  ) => {
    if (!ctx) {
      console.log('Could not get context.')
      return
    }

    const distanceOffset = 50

    const mid: Point = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + distanceOffset,
    ]

    ctx.strokeStyle = color as string
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(...start)
    ctx.quadraticCurveTo(...mid, ...end)
    ctx.stroke()
  }

  const onPlugboardKeyClick = (e: React.MouseEvent<HTMLElement>) => {
    const thisKey = e.currentTarget.dataset.key as Letter

    if (isEditing.current) {
      isEditing.current = false

      if (!thisKey) {
        console.log('No data-key attribute found on element.')
        return
      }

      if (!workingKey) {
        return
      }

      if (thisKey == workingKey || thisKey in machineState.plugboard) {
        clearWorkingCanvas()
        setWorkingKey(null)
        return
      }

      setWorkingKey(null)

      const newPlugboardState = machineState.plugboard
      newPlugboardState[workingKey] = thisKey
      newPlugboardState[thisKey] = workingKey
      setMachineState({
        ...machineState,
        plugboard: newPlugboardState,
      })

      return
    }

    if (thisKey in machineState.plugboard) {
      isEditing.current = false
      const newPlugboardState = machineState.plugboard

      delete newPlugboardState[newPlugboardState[thisKey] as Letter]
      delete newPlugboardState[thisKey]

      setMachineState({
        ...machineState,
        plugboard: newPlugboardState,
      })
    }

    setWorkingKey(thisKey)

    const dotRect = e.currentTarget.children[0].getBoundingClientRect()

    if (!canvasRect.current) {
      console.log('Could not get canvas rect.')
      return
    }

    workingBezierStart.current = [
      dotRect.left - canvasRect.current.left + dotRect.width / 2,
      dotRect.top - canvasRect.current.top + dotRect.height / 2,
    ]

    isEditing.current = true
  }

  const onPlugboardMouseMove = (e: React.MouseEvent) => {
    if (!isEditing.current) return

    if (
      !workingCanvas.current ||
      !canvasRect.current ||
      !workingBezierStart.current
    ) {
      console.log('Refs not set yet.')
      return
    }

    clearWorkingCanvas()

    let color: Color = workingKey == hoveredKey ? colors.red[500] : 'white'

    drawBezier(
      workingCanvas.current.getContext('2d'),
      workingBezierStart.current,
      [e.clientX - canvasRect.current.left, e.clientY - canvasRect.current.top],
      color,
    )
  }

  const onPlugboardKeyMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const thisKey = e.currentTarget.dataset.key as Letter
    setHoveredKey(thisKey)
  }

  const onPlugboardKeyMouseLeave = () => {
    setHoveredKey(null)
  }

  const keyProps = {
    plugboard: machineState.plugboard,
    isEditing: isEditing.current,
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
          className='p-4 md:p-3 xl:p-10'>
          {KEYBOARD_LAYOUT.map((row) => (
            <div className='mb-2 text-center' key={row}>
              {row.split('').map((char) => (
                <PlugboardKey key={char} char={char as Letter} {...keyProps} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
