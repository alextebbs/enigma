import { Canvas } from '@react-three/fiber'
import { OrbitControls, Wireframe } from '@react-three/drei'
import * as THREE from 'three'

function Scene() {
  const getPoints = (radius, count) => {
    const points = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ),
      )
    }
    return points
  }

  const points = getPoints(5, 26)

  return (
    <>
      <mesh rotation={[THREE.MathUtils.degToRad(90), 0, 0]} position-y={-20}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial side={THREE.DoubleSide} color='#333' />
      </mesh>

      <group rotation={[THREE.MathUtils.degToRad(90), 0, 0]}>
        <mesh>
          <cylinderGeometry args={[5, 5, 2, 26, 1, true]} />
          <meshBasicMaterial color={'#000000'} side={THREE.DoubleSide} />

          {points.map((point, index) => {
            return (
              <mesh key={index} position={point}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color={'#ff0000'} />
              </mesh>
            )
          })}

          <Wireframe
            // Other props
            simplify={true} // Remove some edges from wireframes
            fill={'#7cff7c'} // Color of the inside of the wireframe
            fillMix={0} // Mix between the base color and the Wireframe 'fill'. 0 = base; 1 = wireframe
            fillOpacity={0.25} // Opacity of the inner fill
            stroke={'#00ff00'} // Color of the stroke
            strokeOpacity={1} // Opacity of the stroke
            thickness={0.025} // Thinkness of the lines
            colorBackfaces={false} // Whether to draw lines that are facing away from the camera
            backfaceStroke={'#004400'} // Color of the lines that are facing away from the camera
            dashInvert={true} // Invert the dashes
            dash={false} // Whether to draw lines as dashes
            dashRepeats={4} // Number of dashes in one seqment
            dashLength={0.5} // Length of each dash
            squeeze={false} // Narrow the centers of each line segment
            squeezeMin={0.2} // Smallest width to squueze to
            squeezeMax={1} // Largest width to squeeze from
          />
        </mesh>
      </group>
    </>
  )
}

export default function Page(props) {
  return (
    <div className='h-[100vh] bg-black'>
      <Canvas
        orthographic
        gl={{ antialias: true }}
        camera={{ zoom: 100, near: 1, far: 2000, position: [-150, 75, 100] }}>
        <Scene />

        <directionalLight intensity={0.75} />
        <ambientLight intensity={0.75} />
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
