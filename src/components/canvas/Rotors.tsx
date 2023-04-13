import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Wireframe,
  QuadraticBezierLine,
  Html,
  Text,
} from '@react-three/drei'
import { ALPHA } from '@/_globals'
import * as THREE from 'three'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'tailwind.config.js'

const {
  theme: { colors },
} = resolveConfig(tailwindConfig)

const ROTOR_RADIUS = 3
const ROTOR_WIDTH = 1.5
const ROTOR_GAP = 1

const ACTIVE_COLOR = colors.yellow['500']
const RETURN_COLOR = colors.pink['500']
const DEFAULT_COLOR = colors.gray['800']
const MID_COLOR = '#EB7E51'

const ACTIVE_CLASS = 'text-yellow-500'
const RETURN_CLASS = 'text-pink-500'
const DEFAULT_CLASS = 'text-gray-500'
const MID_CLASS = 'text-[#eb7e51]'

const getPoints = (radius, count, offset) => {
  const points = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        offset,
        Math.sin(angle) * radius,
      ),
    )
  }
  return points
}

// Find the center between two points in 3d space
const getCenterPoint = (pointA, pointB) => {
  return new THREE.Vector3(
    (pointA.x + pointB.x) / 2,
    (pointA.y + pointB.y) / 2,
    (pointA.z + pointB.z) / 2,
  )
}

function Reflector({ machineState, transformationLog }) {
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

        if (transformationLog) {
          if (
            letter == transformationLog.reflector.enter ||
            letter == transformationLog.reflector.exit
          ) {
            color = MID_COLOR
            className = MID_CLASS
          }
        }

        centerPoint.y = centerPoint.y - 1

        return (
          <>
            <group position={wireStart}>
              <Html
                as='div' // Wrapping element (default: 'div')
                wrapperClass='pointer-events-none select-none'
                center // Adds a -50%/-50% css transform (default: false) [ignored in transform mode]
                transform // If true, applies matrix3d transformations (default=false)
                sprite // Renders as sprite, but only in transform mode (default=false)
                position-x={0.15}>
                <div className={`${className} text-[0.25rem]`}>{letter}</div>
              </Html>
              <mesh>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshBasicMaterial color={color} />
              </mesh>
            </group>

            <QuadraticBezierLine
              start={wireStart}
              end={wireEnd}
              mid={centerPoint}
              lineWidth={1}
              color={color}
            />
          </>
        )
      })}
    </group>
  )
}

function Rotor({ rotor, rotorIndex, machineState, transformationLog }) {
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
            } else if (log.backwards.exit == letterToCheck) {
              color = RETURN_COLOR
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
                <Html
                  as='div' // Wrapping element (default: 'div')
                  wrapperClass='pointer-events-none select-none'
                  center // Adds a -50%/-50% css transform (default: false) [ignored in transform mode]
                  transform // If true, applies matrix3d transformations (default=false)
                  sprite // Renders as sprite, but only in transform mode (default=false)
                  position-x={0.15}>
                  <div className={`${className} text-[0.25rem]`}>{letter}</div>
                </Html>
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
                  <mesh>
                    <sphereGeometry args={[0.025, 16, 16]} />
                    <meshBasicMaterial color={color} />
                  </mesh>
                </group>
                <group position={wireEnd}>
                  <mesh>
                    <sphereGeometry args={[0.025, 16, 16]} />
                    <meshBasicMaterial color={color} />
                  </mesh>
                </group>
                <group>
                  <QuadraticBezierLine
                    start={centerPoint}
                    end={wireStart}
                    color={color}
                    lineWidth={1}
                  />

                  <QuadraticBezierLine
                    start={centerPoint}
                    end={wireEnd}
                    color={color}
                    lineWidth={1}
                  />

                  <QuadraticBezierLine
                    start={wireEnd}
                    end={nextPoint}
                    color={color}
                    lineWidth={1}
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

export default function RotorsScene({
  machineState,
  currentPressedKey,
  transformationLog,
}) {
  const offset =
    (machineState.rotors.length * ROTOR_WIDTH +
      (machineState.rotors.length - 2) * ROTOR_GAP) /
    2

  return (
    <div className='h-[80vh] bg-black'>
      <Canvas
        orthographic
        gl={{ antialias: true }}
        camera={{ zoom: 100, near: 1, far: 2000, position: [50, 75, 100] }}>
        <group position={[offset, 0, 0]}>
          {machineState.rotors.map((rotor, rotorIndex) => {
            return (
              <Rotor
                key={rotorIndex}
                {...{
                  rotor,
                  rotorIndex,
                  currentPressedKey,
                  machineState,
                  transformationLog,
                }}
              />
            )
          })}
          <Reflector {...{ machineState, transformationLog }} />
        </group>

        <directionalLight intensity={0.75} />
        <ambientLight intensity={0.75} />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
