import * as THREE from 'three'
import { ALPHA, MachineState, WireTable } from '../machine/Machine'
import { QuadraticBezierLine, Wireframe, Text, Line } from '@react-three/drei'
import {
  ROTOR_GAP,
  ROTOR_RADIUS,
  ROTOR_WIDTH,
  ACTIVE_CLASS,
  ACTIVE_COLOR,
  DRAGGING_COLOR,
  DEFAULT_CLASS,
  DEFAULT_COLOR,
  RETURN_CLASS,
  RETURN_COLOR,
  getPoints,
  getCenterPoint,
  Dot,
  TextLabel,
} from './RotorScene'
import { useThree } from '@react-three/fiber'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  BidirectionalLogEntry,
  Rotor as RotorInterface,
} from '../machine/Machine'
import { useSpring, animated } from '@react-spring/three'
import { useGesture } from '@use-gesture/react'

import { Globals } from '@react-spring/shared'

Globals.assign({
  frameLoop: 'always',
})

interface RotorProps {
  rotor: RotorInterface
  rotorIndex: number
  rotorLog: BidirectionalLogEntry | null | undefined
  isDragging: boolean
  setIsDragging: Dispatch<SetStateAction<boolean>>
  setMachineState: Dispatch<SetStateAction<MachineState>>
  clearMachine: () => void
}

export const Rotor: React.FC<RotorProps> = (props) => {
  const {
    rotor,
    rotorIndex,
    rotorLog,
    setIsDragging,
    isDragging,
    setMachineState,
    clearMachine,
  } = props

  const inputPoints = getPoints(
    ROTOR_RADIUS * 0.9,
    ALPHA.length,
    ROTOR_WIDTH / 2 + ROTOR_GAP / 2,
  )

  const outputPoints = getPoints(
    ROTOR_RADIUS * 0.9,
    ALPHA.length,
    -ROTOR_WIDTH / 2,
  )

  const [isInteracting, setIsInteracting] = useState<boolean | undefined>(false)

  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  const [outerSpring, setOuterSpring] = useSpring(() => ({
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    config: {
      mass: 1,
      friction: 26,
      tension: 170,
    },
  }))

  const step = (Math.PI * 2) / ALPHA.length

  const targetAngle = step * rotor.visualPosition

  setOuterSpring({ rotation: [0, targetAngle, 0] })

  const outerBind = useGesture(
    {
      onDrag: ({ event, active, offset: [x, y] }) => {
        event.stopPropagation()
        setIsDragging(active)
        setIsInteracting(active)
        clearMachine()

        const dragAngle = y / aspect / 2
        const dragAngleStepped = Math.ceil(dragAngle / step) * step
        const visualOffset = Math.round(dragAngleStepped / step)
        const newOffset = (visualOffset + ALPHA.length) % ALPHA.length

        setMachineState((prevState) => ({
          ...prevState,
          rotors: prevState.rotors.map((rotor, index) => {
            if (index === rotorIndex) {
              return {
                ...rotor,
                offset: newOffset,
                position: newOffset,
                visualPosition: visualOffset,
              }
            } else {
              return rotor
            }
          }),
        }))
      },
    },
    // { drag: { from: [0, 0] } },
  )

  const innerBind = useGesture({
    onHover: ({ hovering, event }) => {
      event.stopPropagation()

      if (!isDragging) {
        setIsInteracting(hovering)
      }
    },
  })

  useEffect(() => {
    document.body.style.cursor = isInteracting ? 'grab' : 'auto'
  }, [isInteracting])

  return (
    <group
      position={[-rotorIndex * (ROTOR_WIDTH + ROTOR_GAP), 0, 0]}
      rotation={[
        THREE.MathUtils.degToRad(45),
        THREE.MathUtils.degToRad(180),
        THREE.MathUtils.degToRad(90),
      ]}>
      {/* @ts-ignore */}
      <animated.group {...outerSpring} {...outerBind()}>
        {/* @ts-ignore */}
        <group {...innerBind()}>
          <mesh>
            <cylinderGeometry
              args={[
                ROTOR_RADIUS,
                ROTOR_RADIUS,
                ROTOR_WIDTH - 0.5,
                ALPHA.length,
                1,
                true,
              ]}
            />
            <meshBasicMaterial color='#000000' />
            <Wireframe
              // Other props
              simplify={true} // Remove some edges from wireframes
              stroke={isInteracting ? '#92afd7' : '#819abe'} // Color of the stroke
              thickness={0.025} // Thinkness of the lines
              backfaceStroke={isInteracting ? '#6381a8' : '#4f6685'} // Color of the lines that are facing away from the camera
              dashInvert={true} // Invert the dashes
            />
          </mesh>

          {ALPHA.map((_, index) => (
            <group
              key={index}
              rotation={[
                THREE.MathUtils.degToRad(0),
                THREE.MathUtils.degToRad((360 / ALPHA.length) * -index),
                THREE.MathUtils.degToRad(0),
              ]}>
              <Text
                rotation={[
                  THREE.MathUtils.degToRad(90),
                  THREE.MathUtils.degToRad(90),
                  THREE.MathUtils.degToRad(0),
                ]}
                position={[ROTOR_RADIUS, 0, 0]}
                fontSize={0.2}
                color={'#42556f'}
                font={'/fonts/inconsolata/inconsolata-v31-latin-regular.woff'}
                characters={ALPHA.join('')}>
                {index + 1}
              </Text>
            </group>
          ))}
        </group>

        {ALPHA.map((letter, index) => {
          const wireStart = inputPoints[index]
          const curveStart = new THREE.Vector3()
          curveStart.copy(wireStart)
          curveStart.y = wireStart.y - ROTOR_GAP / 2

          const wireEnd =
            outputPoints[ALPHA.indexOf(rotor.wiring[index] as keyof WireTable)]
          const centerPoint = getCenterPoint(wireStart, wireEnd)
          const nextPoint = new THREE.Vector3()
          nextPoint.copy(wireEnd)
          nextPoint.y = nextPoint.y - ROTOR_GAP / 2

          let color = isInteracting ? DRAGGING_COLOR : DEFAULT_COLOR
          let className = DEFAULT_CLASS
          let lineWidth = 1

          const letterToCheck =
            ALPHA[
              (ALPHA.indexOf(letter) - rotor.position + ALPHA.length) %
                ALPHA.length
            ]

          if (!isDragging) {
            if (rotorLog?.forwards.enter == letterToCheck) {
              color = ACTIVE_COLOR
              lineWidth = 2
            } else if (rotorLog?.backwards.exit == letterToCheck) {
              color = RETURN_COLOR
              lineWidth = 2
            }

            if (rotorLog?.forwards.enter == letter) {
              className = ACTIVE_CLASS
            } else if (rotorLog?.backwards.exit == letter) {
              className = RETURN_CLASS
            }
          }

          return (
            <group key={index}>
              {((rotorLog?.forwards.enter == letter && !isDragging) ||
                (rotorLog?.backwards.exit == letter && !isDragging)) && (
                <group
                  position={
                    inputPoints[(index + rotor.position) % ALPHA.length]
                  }>
                  <TextLabel
                    letter={letter}
                    extraClass={className}
                    color={color}
                  />
                </group>
              )}

              <group>
                <group position={wireStart}>
                  <Dot color={color} />
                </group>
                <group position={nextPoint}>
                  <Dot color={color} />
                </group>
                <group>
                  <QuadraticBezierLine
                    start={centerPoint}
                    end={curveStart}
                    color={color as unknown as THREE.Color}
                    lineWidth={lineWidth}
                  />
                  <QuadraticBezierLine
                    start={centerPoint}
                    end={wireEnd}
                    color={color as unknown as THREE.Color}
                    lineWidth={lineWidth}
                  />
                  <Line
                    points={[wireEnd, nextPoint]}
                    color={color as unknown as THREE.Color}
                    lineWidth={lineWidth}
                  />
                  <Line
                    points={[wireStart, curveStart]}
                    color={color as unknown as THREE.Color}
                    lineWidth={lineWidth}
                  />
                </group>
              </group>
            </group>
          )
        })}
      </animated.group>
    </group>
  )
}
