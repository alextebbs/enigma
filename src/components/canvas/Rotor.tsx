import * as THREE from 'three'
import { ALPHA } from '@/_globals'
import { QuadraticBezierLine } from '@react-three/drei'
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

export default function Rotor({
  rotor,
  rotorIndex,
  machineState,
  transformationLog,
}) {
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

  return (
    <group
      position={[-rotorIndex * (ROTOR_WIDTH + ROTOR_GAP), 0, 0]}
      rotation={[
        THREE.MathUtils.degToRad(45 + rotor.offset * (360 / ALPHA.length)),
        THREE.MathUtils.degToRad(180),
        THREE.MathUtils.degToRad(90),
      ]}>
      <group>
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

          if (transformationLog) {
            const log = transformationLog.rotors[rotorIndex]
            const letterToCheck =
              ALPHA[
                (ALPHA.indexOf(letter) -
                  machineState.rotors[rotorIndex].position +
                  ALPHA.length) %
                  ALPHA.length
              ]

            if (log.forwards.enter == letterToCheck) {
              color = ACTIVE_COLOR
              lineWidth = 2
            } else if (log.backwards.exit == letterToCheck) {
              color = RETURN_COLOR
              lineWidth = 2
            }

            if (log.forwards.enter == letter) {
              className = ACTIVE_CLASS
            } else if (log.backwards.exit == letter) {
              className = RETURN_CLASS
            }
          }

          return (
            <>
              {/* STATIC ELEMENTS */}
              <group position={wireStart}>
                <TextLabel
                  letter={letter}
                  extraClass={className}
                  color={color}
                />
              </group>

              {/* ROTATING ELEMENTS */}
              <group
                rotation={[
                  0,
                  machineState.rotors[rotorIndex].position *
                    ((Math.PI * 2) / ALPHA.length),
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
    </group>
  )
}
