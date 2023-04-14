import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'tailwind.config.js'
import Rotor from './Rotor'
import Reflector from './Reflector'

const {
  theme: { colors },
} = resolveConfig(tailwindConfig)

export const ROTOR_RADIUS = 3
export const ROTOR_WIDTH = 1.5
export const ROTOR_GAP = 1

export const ACTIVE_COLOR = colors.yellow['500']
export const RETURN_COLOR = colors.pink['500']
export const DEFAULT_COLOR = colors.gray['800']
export const MID_COLOR = '#EB7E51'

export const ACTIVE_CLASS = 'text-yellow-500'
export const RETURN_CLASS = 'text-pink-500'
export const DEFAULT_CLASS = 'text-gray-500'
export const MID_CLASS = 'text-[#eb7e51]'

export const getPoints = (radius, count, offset) => {
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
export const getCenterPoint = (pointA, pointB) => {
  return new THREE.Vector3(
    (pointA.x + pointB.x) / 2,
    (pointA.y + pointB.y) / 2,
    (pointA.z + pointB.z) / 2,
  )
}

export function TextLabel({ letter, extraClass, color }) {
  return (
    <Html
      as='div' // Wrapping element (default: 'div')
      wrapperClass='pointer-events-none select-none'
      center // Adds a -50%/-50% css transform (default: false) [ignored in transform mode]
      transform // If true, applies matrix3d transformations (default=false)
      sprite // Renders as sprite, but only in transform mode (default=false)
      position-x={0.15}>
      <div className={`${extraClass} text-[0.25rem]`}>{letter}</div>
    </Html>
  )
}

export function Dot({ color }) {
  return (
    <mesh>
      <sphereGeometry args={[0.025, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

export default function RotorsScene({ machineState, transformationLog }) {
  const offset =
    (machineState.rotors.length * ROTOR_WIDTH +
      (machineState.rotors.length - 2) * ROTOR_GAP) /
    2

  return (
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
  )
}
