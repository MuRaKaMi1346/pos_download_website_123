import { RoundedBox, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import type { MotionValue } from 'framer-motion'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'

import Cup from './Cup'

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  const cup = useRef<THREE.Group>(null)
  const tablet = useRef<THREE.Group>(null)
  const texture = useTexture('/images/pos.webp')
  texture.colorSpace = THREE.SRGBColorSpace

  useFrame((_, delta) => {
    const p = progress.get()
    if (cup.current) {
      cup.current.rotation.y += delta * 0.3
      cup.current.rotation.z = THREE.MathUtils.degToRad(6) * Math.sin(p * Math.PI)
    }
    if (tablet.current) {
      tablet.current.position.y = THREE.MathUtils.lerp(-4.5, 0.1, smoothstep(0.15, 0.85, p))
      tablet.current.rotation.y = THREE.MathUtils.lerp(-0.55, -0.12, p)
    }
  })

  return (
    <>
      <group ref={cup} position={[-1.7, -0.3, 0]} scale={1.15}>
        <Cup />
      </group>
      <group ref={tablet} position={[1.7, -4.5, -0.4]} rotation={[0.05, -0.4, 0]}>
        <RoundedBox args={[3.3, 2.12, 0.12]} radius={0.08} smoothness={5}>
          <meshStandardMaterial color="#241d18" metalness={0.5} roughness={0.45} />
        </RoundedBox>
        <mesh position={[0, 0, 0.064]}>
          <planeGeometry args={[3.06, 1.9]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </>
  )
}

function Rig({ progress }: { progress: MotionValue<number> }) {
  const camera = useThree((state) => state.camera)
  useFrame(() => {
    const p = progress.get()
    camera.position.z = THREE.MathUtils.lerp(7.2, 4.8, p)
    camera.position.y = THREE.MathUtils.lerp(0.7, 0.15, p)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function ProductScene({ progress }: { progress: MotionValue<number> }) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), [])
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.7, 7.2], fov: 38 }}
    >
      <color attach="background" args={['#1b110b']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 7, 6]} intensity={2.4} color="#ffdca6" />
      <directionalLight position={[-6, 2, -4]} intensity={0.7} color="#8fb0ff" />
      <Suspense fallback={null}>
        <Scene progress={progress} />
      </Suspense>
      <Rig progress={progress} />
      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur />
        <Noise opacity={0.04} />
        <Vignette offset={0.3} darkness={0.35} eskil={false} />
        <ChromaticAberration offset={caOffset} radialModulation={false} modulationOffset={0} />
      </EffectComposer>
    </Canvas>
  )
}
