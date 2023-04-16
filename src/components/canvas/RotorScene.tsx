import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import Rotor from './Rotor'
import Reflector from './Reflector'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'tailwind.config'

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

// Get a series of points along a circle, and give them an optional Y axis offset
export const getPoints = (
  radius: number,
  count: number,
  offset: number = 0,
) => {
  const points: THREE.Vector3[] = []

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

export const getCenterPoint = (
  pointA: THREE.Vector3,
  pointB: THREE.Vector3,
) => {
  return new THREE.Vector3(
    (pointA.x + pointB.x) / 2,
    (pointA.y + pointB.y) / 2,
    (pointA.z + pointB.z) / 2,
  )
}

export function TextLabel({ letter, extraClass, color }) {
  return (
    <Html
      as='div'
      wrapperClass={`pointer-events-none select-none text-[0.25rem] ${extraClass}`}
      center
      transform
      sprite
      position-x={0.15}
      occlude={true}>
      {letter}
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
      className='h-full'
      camera={{ zoom: 100, near: 1, far: 2000, position: [50, 75, 100] }}>
      <group position={[offset, 0, 0]}>
        {machineState.rotors.map((rotor, rotorIndex) => {
          return (
            <Rotor
              key={rotorIndex}
              {...{
                rotor,
                rotorIndex,
                transformationLog,
              }}
            />
          )
        })}
        <Reflector {...{ machineState, transformationLog }} />
      </group>

      {/* where we're going, we don't need lights 
      <directionalLight intensity={0.75} />
      <ambientLight intensity={0.75} />*/}

      <OrbitControls makeDefault />
    </Canvas>
  )
}
