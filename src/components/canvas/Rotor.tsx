import * as THREE from 'three'
import { ALPHA, WireTable } from '../machine/Machine'
import { QuadraticBezierLine, Wireframe, Text, Line } from '@react-three/drei'
import {
  ROTOR_GAP,
  ROTOR_RADIUS,
  ROTOR_WIDTH,
  ACTIVE_CLASS,
  ACTIVE_COLOR,
  DEFAULT_CLASS,
  DEFAULT_COLOR,
  RETURN_CLASS,
  RETURN_COLOR,
  getPoints,
  getCenterPoint,
  Dot,
  TextLabel,
} from './RotorScene'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import {
  BidirectionalLogEntry,
  Rotor as RotorInterface,
} from '../machine/Machine'
import { useSpring, animated } from '@react-spring/three'
import { useGesture } from '@use-gesture/react'

interface RotorProps {
  rotor: RotorInterface
  rotorIndex: number
  rotorLog: BidirectionalLogEntry | null | undefined
}

export const Rotor: React.FC<RotorProps> = (props) => {
  const { rotor, rotorIndex, rotorLog } = props

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

  const rotorRef = useRef<THREE.Group | null>(null)

  // useFrame((state, delta) => {
  //   if (rotorRef.current) {
  //     if (rotorRef.current.rotation.y < targetAngle)
  //       rotorRef.current.rotation.y += 2 * delta
  //     if (rotorRef.current.rotation.y > targetAngle)
  //       rotorRef.current.rotation.y -= 2 * delta
  //   }
  // })

  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  const [spring, set] = useSpring(() => ({
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    config: {
      mass: 1,
      friction: 26,
      tension: 170,
    },
  }))

  const targetAngle = THREE.MathUtils.degToRad(
    (360 / ALPHA.length) * rotor.position,
  )

  console.log(targetAngle)

  set({
    rotation: [0, targetAngle, 0],
  })

  const bind = useGesture({
    onDrag: ({ offset: [x, y], event }) => {
      console.log('x', x, 'y', y)
      event.stopPropagation()
      set({
        // position: [x / aspect, -y / aspect, 0],
        rotation: [0, y / aspect / 2, 0],
      })
    },
    onHover: ({ hovering, event }) => {
      event.stopPropagation()
      set({ scale: hovering ? [1.05, 1.05, 1.05] : [1, 1, 1] })
    },
  })

  return (
    <group
      position={[-rotorIndex * (ROTOR_WIDTH + ROTOR_GAP), 0, 0]}
      rotation={[
        THREE.MathUtils.degToRad(45 + rotor.offset * (360 / ALPHA.length)),
        THREE.MathUtils.degToRad(180),
        THREE.MathUtils.degToRad(90),
      ]}>
      <group>
        {/* @ts-ignore */}
        <animated.group ref={rotorRef} {...spring} {...bind()}>
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
              stroke={'#819abe'} // Color of the stroke
              thickness={0.025} // Thinkness of the lines
              backfaceStroke={'#4f6685'} // Color of the lines that are facing away from the camera
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
                color={'#334155'}
                font={'/fonts/inconsolata/inconsolata-v31-latin-regular.woff'}
                characters={ALPHA.join('')}>
                {index + 1}
              </Text>
            </group>
          ))}
        </animated.group>

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

          let color = DEFAULT_COLOR
          let className = DEFAULT_CLASS
          let lineWidth = 1

          const letterToCheck =
            ALPHA[
              (ALPHA.indexOf(letter) - rotor.position + ALPHA.length) %
                ALPHA.length
            ]

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

          return (
            <group key={index}>
              {/* STATIC ELEMENTS */}
              {(rotorLog?.forwards.enter == letter ||
                rotorLog?.backwards.exit == letter) && (
                <group position={wireStart}>
                  <TextLabel
                    letter={letter}
                    extraClass={className}
                    color={color}
                  />
                </group>
              )}

              {/* ROTATING ELEMENTS */}
              <group
                rotation={[
                  0,
                  rotor.position * ((Math.PI * 2) / ALPHA.length),
                  0,
                ]}>
                <group position={wireStart}>
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
      </group>
    </group>
  )
}
