import * as THREE from 'three'
import { ALPHA } from '@/_globals'
import { QuadraticBezierLine } from '@react-three/drei'
import {
  ROTOR_GAP,
  ROTOR_RADIUS,
  ROTOR_WIDTH,
  DEFAULT_CLASS,
  DEFAULT_COLOR,
  MID_COLOR,
  ACTIVE_CLASS,
  ACTIVE_COLOR,
  RETURN_CLASS,
  RETURN_COLOR,
  getPoints,
  getCenterPoint,
  Dot,
  TextLabel,
} from './RotorScene'

export default function Reflector({ machineState, reflectorLog }) {
  const reflectorPoints = getPoints(ROTOR_RADIUS * 0.75, ALPHA.length)
  let drawnPoints = []

  return (
    <group
      position={[
        -(ROTOR_WIDTH * machineState.rotors.length) -
          (ROTOR_GAP * machineState.rotors.length - ROTOR_WIDTH / 2),
        0,
        0,
      ]}
      rotation={[
        THREE.MathUtils.degToRad(45),
        THREE.MathUtils.degToRad(180),
        THREE.MathUtils.degToRad(90),
      ]}>
      {ALPHA.map((letter, index) => {
        const wireStart = reflectorPoints[index]
        const wireEnd =
          reflectorPoints[ALPHA.indexOf(machineState.reflector.wiring[index])]
        const centerPoint = getCenterPoint(wireStart, wireEnd)
        centerPoint.y = centerPoint.y - 1

        drawnPoints.push(machineState.reflector.wiring[index])

        let color = DEFAULT_COLOR
        let dotColor = DEFAULT_COLOR
        let className = DEFAULT_CLASS
        let lineWidth = 1

        if (letter == reflectorLog?.enter || letter == reflectorLog?.exit) {
          dotColor = MID_COLOR
          lineWidth = 2
        }

        if (letter == reflectorLog?.enter) {
          color = ACTIVE_COLOR
          className = ACTIVE_CLASS
        }

        if (letter == reflectorLog?.exit) {
          color = RETURN_COLOR
          className = RETURN_CLASS
        }

        centerPoint.y = centerPoint.y + 0.3

        return (
          <group key={letter}>
            {(reflectorLog?.enter == letter ||
              reflectorLog?.exit == letter) && (
              <group position={wireStart}>
                <TextLabel
                  letter={letter}
                  extraClass={className}
                  color={color}
                />
                <Dot color={color} />
              </group>
            )}

            <group position={centerPoint}>
              <Dot color={dotColor} />
            </group>

            <QuadraticBezierLine
              start={centerPoint}
              end={wireStart}
              lineWidth={lineWidth}
              color={color}
            />
          </group>
        )
      })}
    </group>
  )
}
