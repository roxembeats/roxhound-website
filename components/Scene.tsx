'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

function RotatingShape() {
  const meshRef = useRef<THREE.Mesh>(null)
  const accentColor = useAppStore((s) => s.accentColor)
  const shape = useAppStore((s) => s.shape)
  const spinSpeed = useAppStore((s) => s.spinSpeed)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4 * spinSpeed
    }
  })

  return (
    <mesh ref={meshRef}>
      {shape === 'icosahedron' && <icosahedronGeometry args={[1.2, 1]} />}
      {shape === 'box' && <boxGeometry args={[1.6, 1.6, 1.6]} />}
      {shape === 'torus' && <torusGeometry args={[1, 0.4, 16, 100]} />}
      {shape === 'sphere' && <sphereGeometry args={[1.3, 32, 32]} />}
      <meshBasicMaterial color={accentColor} wireframe toneMapped={false} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <RotatingShape />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  )
}
