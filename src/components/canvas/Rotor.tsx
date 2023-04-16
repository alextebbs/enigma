import * as THREE from 'three'
import { ALPHA } from '@/_globals'
import { QuadraticBezierLine, Wireframe, Text } from '@react-three/drei'
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
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export default function Rotor({ rotor, rotorIndex, rotorLog }) {
  const inputPoints = getPoints(
    ROTOR_RADIUS * 0.75,
    ALPHA.length,
    ROTOR_WIDTH / 2,
  )

  const outputPoints = getPoints(
    ROTOR_RADIUS * 0.75,
    ALPHA.length,
    -ROTOR_WIDTH / 2,
  )

  const rotorRef = useRef(null)

  const targetAngle = THREE.MathUtils.degToRad(
    (360 / ALPHA.length) * rotor.position,
  )

  useFrame((state, delta) => {
    if (rotorRef.current) {
      if (rotorRef.current.rotation.y < targetAngle) {
        rotorRef.current.rotation.y += 2 * delta
      }

      if (rotorRef.current.rotation.y > targetAngle) {
        rotorRef.current.rotation.y -= 2 * delta
      }
    }
  })

  return (
    <group
      position={[-rotorIndex * (ROTOR_WIDTH + ROTOR_GAP), 0, 0]}
      rotation={[
        THREE.MathUtils.degToRad(45 + rotor.offset * (360 / ALPHA.length)),
        THREE.MathUtils.degToRad(180),
        THREE.MathUtils.degToRad(90),
      ]}>
      <group ref={rotorRef}>
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
            stroke={'#475569'} // Color of the stroke
            thickness={0.025} // Thinkness of the lines
            backfaceStroke={'#334155'} // Color of the lines that are facing away from the camera
            dashInvert={true} // Invert the dashes
          />
        </mesh>

        {ALPHA.map((letter, index) => {
          return (
            <group
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
          )
        })}
      </group>

      {ALPHA.map((letter, index) => {
        const wireStart = inputPoints[index]
        const wireEnd = outputPoints[ALPHA.indexOf(rotor.wiring[index])]
        const centerPoint = getCenterPoint(wireStart, wireEnd)
        const nextPoint = new THREE.Vector3()
        nextPoint.copy(wireEnd)
        nextPoint.y = nextPoint.y - ROTOR_GAP

        let color = DEFAULT_COLOR
        let className = DEFAULT_CLASS
        let lineWidth = 1

        console.log(rotorLog)

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
          <>
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
              <group position={wireEnd}>
                <Dot color={color} />
              </group>
              <group>
                <QuadraticBezierLine
                  start={centerPoint}
                  end={wireStart}
                  color={color}
                  lineWidth={lineWidth}
                />
                <QuadraticBezierLine
                  start={centerPoint}
                  end={wireEnd}
                  color={color}
                  lineWidth={lineWidth}
                />
                <QuadraticBezierLine
                  start={wireEnd}
                  end={nextPoint}
                  color={color}
                  lineWidth={lineWidth}
                />
              </group>
            </group>
          </>
        )
      })}
    </group>
  )
}
