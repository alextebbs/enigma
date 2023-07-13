import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { Rotor } from './Rotor'
import { Reflector } from './Reflector'
import { MachineState, Log } from '../machine/Machine'
import { colors } from '@/_globals'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

// This is messsed up and makes a type error because I don't think tailwind
// is configured correctly. I'm not sure how to fix it.
//
// import resolveConfig from 'tailwindcss/resolveConfig'
// import tailwindConfig from 'tailwind.config'
// const {
//   theme: { colors },
// } = resolveConfig(tailwindConfig)

export const ROTOR_RADIUS = 3
export const ROTOR_WIDTH = 1.5
export const ROTOR_GAP = 0.75

export const ACTIVE_COLOR = colors.yellow['500']
export const RETURN_COLOR = colors.pink['500']
export const DEFAULT_COLOR = colors.gray['700']
export const DRAGGING_COLOR = colors.gray['600']
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

interface TextLabelProps {
  letter: string
  extraClass?: string
  color?: string
}

export const TextLabel: React.FC<TextLabelProps> = (props) => {
  const { letter, extraClass = '', color = DEFAULT_COLOR } = props

  return (
    <Html
      as='div'
      wrapperClass={`pointer-events-none select-none text-[0.3rem] ${extraClass}`}
      center
      transform
      sprite
      position-x={0.15}
      occlude={true}>
      {letter}
    </Html>
  )
}

interface DotProps {
  color?: string
}

export const Dot: React.FC<DotProps> = (props) => {
  const { color = DEFAULT_COLOR } = props

  return (
    <mesh>
      <sphereGeometry args={[0.025, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

interface RotorsSceneProps {
  machineState: MachineState
  transformationLog: Log | null
  setMachineState: Dispatch<SetStateAction<MachineState>>
  clearMachine: () => void
}

export const RotorsScene: React.FC<RotorsSceneProps> = ({
  machineState,
  transformationLog,
  setMachineState,
  clearMachine,
}) => {
  const offset =
    (machineState.rotors.length * ROTOR_WIDTH +
      (machineState.rotors.length - 2) * ROTOR_GAP) /
    2

  let cameraZoom = 100

  if (typeof window !== 'undefined') {
    if (document.body.clientWidth < 768) {
      cameraZoom = 40
    }
  }

  const [isDragging, setIsDragging] = useState(false)

  return (
    <Canvas
      orthographic
      gl={{ antialias: true }}
      // className='h-full'
      camera={{
        zoom: cameraZoom,
        near: 1,
        far: 2000,
        position: [20, 65, 100],
      }}>
      <group position={[offset, 0, 0]}>
        {machineState.rotors.map((rotor, rotorIndex) => {
          return (
            <Rotor
              key={rotorIndex}
              {...{
                rotor,
                rotorIndex,
                rotorLog: transformationLog?.rotors[rotorIndex],
                isDragging,
                setIsDragging,
                setMachineState,
                machineState,
                clearMachine,
              }}
            />
          )
        })}
        <Reflector
          {...{ machineState, reflectorLog: transformationLog?.reflector }}
        />
      </group>

      <directionalLight intensity={0.75} />
      <ambientLight intensity={0.75} />
      {/* <ambientLight color={0xffffff} /> */}

      <OrbitControls
        makeDefault
        minZoom={40}
        maxZoom={100}
        enabled={!isDragging}
      />
    </Canvas>
  )
}
