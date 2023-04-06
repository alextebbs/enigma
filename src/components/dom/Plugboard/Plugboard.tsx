import { KeyboardLayout } from '@/_globals'
import { useEffect, useState } from 'react'

type Point = [x: number, y: number]

/*
  TODO: 1. Draw the canvas dynamically, ie - make a new canvas for each event click
        2. Deal with removing items
        3. Hovering over an active item should highlight it's partner
*/

const canvasConfig = [
  {
    from: 'A',
    to: 'B',
  },
  {
    from: 'C',
    to: 'D',
  },
  {
    from: 'I',
    to: 'Y',
  },
]

const getDistance = (x1, y1, x2, y2) => {
  let y = x2 - x1
  let x = y2 - y1
  return Math.sqrt(x * x + y * y)
}

export default function Plugboard() {
  useEffect(() => {
    const c = document.getElementById('plugboardCanvas') as HTMLCanvasElement
    c.style.width = '100%'
    c.style.height = '100%'
    c.width = c.offsetWidth
    c.height = c.offsetHeight

    drawPlugboardState(canvasConfig, c.getContext('2d'), c)
  })

  const [isEditing, setIsEditing] = useState(false)

  const drawPlugboardState = (canvasConfig, ctx, c) => {
    canvasConfig.forEach((cfgItem) => {
      const startEl = document.querySelector(`[data-key="${cfgItem.from}"]`)
      const endEl = document.querySelector(`[data-key="${cfgItem.to}"]`)

      ;[startEl, endEl].forEach((el) => {
        el.children[0].classList.add('bg-white')
      })

      const startRect = startEl.children[0].getBoundingClientRect()
      const endRect = endEl.children[0].getBoundingClientRect()

      const cRect = c.getBoundingClientRect()

      const bezierStart: Point = [
        startRect.left - cRect.left + startRect.width / 2,
        startRect.top - cRect.top + startRect.height / 2,
      ]

      const bezierEnd: Point = [
        endRect.left - cRect.left + endRect.width / 2,
        endRect.top - cRect.top + endRect.height / 2,
      ]

      let bezierControlPoint: Point = [(bezierStart[0] + bezierEnd[0]) / 2, (bezierStart[1] + bezierEnd[1]) / 2 + 120]

      drawBezier(ctx, bezierStart, bezierControlPoint, bezierEnd)
    })
  }

  const handlePlugboardMouseEnter = (e) => {}

  const drawBezier = (ctx: CanvasRenderingContext2D, start: Point, mid: Point, end: Point) => {
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(...start)
    ctx.quadraticCurveTo(...mid, ...end)
    ctx.stroke()
  }

  const handlePlugboardMouseMove = (e: MouseEvent, c, ctx, cRect, bezierStart) => {
    ctx.clearRect(0, 0, c.width, c.height)
    let bezierEnd: Point = [e.clientX - cRect.left, e.clientY - cRect.top]
    let bezierControlPoint: Point = [(bezierStart[0] + bezierEnd[0]) / 2, (bezierStart[1] + bezierEnd[1]) / 2 + 120]
    drawBezier(ctx, bezierStart, bezierControlPoint, bezierEnd)
  }

  const handlePlugboardClick = (e) => {
    if (isEditing) {
      setIsEditing(false)
      return
    }

    setIsEditing(true)

    const c = document.getElementById('plugboardCanvas') as HTMLCanvasElement
    const plugboard = document.getElementById('plugboard')
    const ctx = c.getContext('2d')

    const thisKey = e.currentTarget
    const thisDot = thisKey.children[0]

    thisDot.classList.add('bg-white')
    thisKey.classList.add('bg-green-900')

    const dotRect = thisDot.getBoundingClientRect()
    const cRect = c.getBoundingClientRect()

    const bezierStart: Point = [
      dotRect.left - cRect.left + dotRect.width / 2,
      dotRect.top - cRect.top + dotRect.height / 2,
    ]

    // Dunno why this doesn't work
    // let bezierEnd: Point = [e.clientX - cRect.left, e.clientY - cRect.top]
    // let bezierControlPoint: Point = [(bezierStart[0] + bezierEnd[0]) / 2, (bezierStart[1] + bezierEnd[1]) / 2 + 120]
    // drawBezier(ctx, bezierStart, bezierControlPoint, bezierEnd)

    const handlePlugboardMouseMoveWrapper = (event) => handlePlugboardMouseMove(event, c, ctx, cRect, bezierStart)

    plugboard.addEventListener('mousemove', handlePlugboardMouseMoveWrapper)

    const keys = document.querySelectorAll('.plugboardKey')

    keys.forEach((key) => {
      key.addEventListener('click', (e) => {
        plugboard.removeEventListener('mousemove', handlePlugboardMouseMoveWrapper)
        const thisTarget = e.currentTarget as Element

        thisDot.classList.remove('bg-white')
        thisKey.classList.remove('bg-green-900')
      })
    })
  }

  return (
    <div className='flex align-center justify-center'>
      <div className='relative'>
        <div className={`absolute w-full h-full pointer-events-none`}>
          <canvas id='plugboardCanvas'></canvas>
        </div>
        <div id='plugboard' className='py-5'>
          {KeyboardLayout.map((row) => {
            return (
              <div className='text-center mb-3' key={row}>
                {row.split('').map((char) => {
                  return (
                    <span
                      key={char}
                      data-key={char}
                      onClick={(e) => handlePlugboardClick(e)}
                      onMouseEnter={(e) => handlePlugboardMouseEnter(e)}
                      className='plugboardKey inline-block px-3 mx-2 py-2 pb-3 rounded-sm lowercase border font-mono text-green-500 border-green-500 hover:cursor-pointer'>
                      {char.toLowerCase()}
                      <div className='rounded-full w-3 h-3 border-2 border-green-500 mt-2'></div>
                    </span>
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
