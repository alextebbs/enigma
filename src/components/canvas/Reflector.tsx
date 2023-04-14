import * as THREE from 'three'
import { ALPHA } from '@/_globals'
import { QuadraticBezierLine } from '@react-three/drei'
import {
  ROTOR_GAP,
  ROTOR_RADIUS,
  ROTOR_WIDTH,
  DEFAULT_CLASS,
  DEFAULT_COLOR,
  MID_CLASS,
  MID_COLOR,
  getPoints,
  getCenterPoint,
  Dot,
  TextLabel,
} from './RotorScene'

export default function Reflector({ machineState, transformationLog }) {
  const reflectorPoints = getPoints(ROTOR_RADIUS * 0.75, ALPHA.length, 0)

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

        let color = DEFAULT_COLOR
        let className = DEFAULT_CLASS
        let lineWidth = 1

        if (transformationLog) {
          if (
            letter == transformationLog.reflector.enter ||
            letter == transformationLog.reflector.exit
          ) {
            color = MID_COLOR
            className = MID_CLASS
            lineWidth = 2
          }
        }

        centerPoint.y = centerPoint.y - 1

        return (
          <>
            <group position={wireStart}>
              <TextLabel letter={letter} extraClass={className} color={color} />
              <Dot color={color} />
            </group>

            <QuadraticBezierLine
              start={wireStart}
              end={wireEnd}
              mid={centerPoint}
              lineWidth={lineWidth}
              color={color}
            />
          </>
        )
      })}
    </group>
  )
}
