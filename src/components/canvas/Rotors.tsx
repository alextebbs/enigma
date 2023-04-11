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

function Reflector() {
  return <mesh />
}

function Rotor({ rotor, rotorIndex }) {
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

          return (
            <>
              {/* <Text
                rotation={[
                  0,
                  THREE.MathUtils.degToRad(
                    -((360 / ALPHA.length) * index) + 90,
                  ),
                  THREE.MathUtils.degToRad(90),
                ]}
                position={textPoints[index]}
                fontSize={0.3}
                font='/fonts/inconsolata/inconsolata-v31-latin-regular.woff'
                color={'green'}>
                {ALPHA[index]}
              </Text> */}

              <group position={wireStart}>
                <mesh>
                  <sphereGeometry args={[0.025, 16, 16]} />
                  <meshBasicMaterial color={color} />
                </mesh>

                <Html
                  as='div' // Wrapping element (default: 'div')
                  wrapperClass='pointer-events-none select-none'
                  center // Adds a -50%/-50% css transform (default: false) [ignored in transform mode]
                  transform // If true, applies matrix3d transformations (default=false)
                  sprite // Renders as sprite, but only in transform mode (default=false)
                  position-x={0.15}>
                  <div className='text-gray-500 text-[0.25rem]'>{letter}</div>
                </Html>
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
            </>
          )
        })}
      </group>
    </group>
  )
}

export default function RotorsScene({
  rotors,
  currentPressedKey,
  transformationChain,
  rotorPositions,
}) {
  const offset =
    (rotors.length * ROTOR_WIDTH + (rotors.length - 2) * ROTOR_GAP) / 2

  return (
    <div className='bg-black h-[80vh]'>
      <Canvas
        orthographic
        gl={{ antialias: true }}
        camera={{ zoom: 100, near: 1, far: 2000, position: [50, 75, 100] }}>
        <group position={[offset, 0, 0]}>
          {rotors.map((rotor, rotorIndex) => {
            return (
              <Rotor
                key={rotorIndex}
                {...{
                  rotor,
                  rotorIndex,
                  currentPressedKey,
                  transformationChain,
                  rotorPositions,
                }}
              />
            )
          })}
          <Reflector />
        </group>

        <directionalLight intensity={0.75} />
        <ambientLight intensity={0.75} />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
