"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function generateWavePoints(
  offset: number,
  amplitude: number,
  length: number,
  segments: number
): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * length - length / 2;
    const y = Math.sin(t * 0.6 + offset) * amplitude;
    points.push([t, y, 0]);
  }
  return points;
}

function FloatingLine({
  position,
  color,
  offset,
  amplitude,
  speed,
  pulseSpeed,
}: {
  position: [number, number, number];
  color: string;
  offset: number;
  amplitude: number;
  speed: number;
  pulseSpeed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const points = useMemo(
    () => generateWavePoints(offset, amplitude, 12, 60),
    [offset, amplitude]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.4;
      groupRef.current.rotation.z = Math.sin(t * speed * 0.3) * 0.05;
    }

    // move the glowing dot along the wave path
    if (dotRef.current) {
      const progress = (t * pulseSpeed + offset) % 1;
      const idx = Math.floor(progress * (points.length - 1));
      const p = points[idx];
      dotRef.current.position.set(p[0], p[1], p[2]);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Line points={points} color={color} lineWidth={1.5} transparent opacity={0.45} />
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    // subtle parallax: scene tilts slightly toward the cursor
    const targetX = state.pointer.y * 0.15;
    const targetY = state.pointer.x * 0.15;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
  });

  const lines = [
    { position: [0, 2, -1] as [number, number, number], color: "#6366F1", offset: 0, amplitude: 0.6, speed: 0.3, pulseSpeed: 0.15 },
    { position: [0, 1, -2] as [number, number, number], color: "#8457E8", offset: 1.5, amplitude: 0.7, speed: 0.22, pulseSpeed: 0.1 },
    { position: [0, 0, -1.5] as [number, number, number], color: "#A855F7", offset: 3, amplitude: 0.8, speed: 0.25, pulseSpeed: 0.18 },
    { position: [0, -1, -2.5] as [number, number, number], color: "#5FA8ED", offset: 4.5, amplitude: 0.5, speed: 0.28, pulseSpeed: 0.12 },
    { position: [0, -2, -1] as [number, number, number], color: "#22D3EE", offset: 6, amplitude: 0.7, speed: 0.2, pulseSpeed: 0.2 },
  ];

  return (
    <group ref={groupRef}>
      {lines.map((l, i) => (
        <FloatingLine key={i} {...l} />
      ))}
    </group>
  );
}

export default function Scene3D() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.9} />
      <Scene />
    </Canvas>
  );
}