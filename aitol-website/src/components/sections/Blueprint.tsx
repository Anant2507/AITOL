"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import dynamic from "next/dynamic";
import RevealSection from "../RevealSection";

type Node = {
  id: string;
  label: string;
  desc: string;
  position: [number, number, number];
  color: string;
};

const nodes: Node[] = [
  { id: "request", label: "Request", desc: "Your app sends a prompt", position: [-4, 1.5, 0], color: "#6366F1" },
  { id: "cache", label: "Cache", desc: "Checked against prior responses", position: [-2, -0.5, 1], color: "#8457E8" },
  { id: "mrl", label: "MRL / CCE", desc: "Prompt compiled down", position: [0, 1.2, -1], color: "#A855F7" },
  { id: "router", label: "Router", desc: "Cheapest capable model chosen", position: [2, -0.5, 1], color: "#5FA8ED" },
  { id: "model", label: "Model", desc: "Response returned + cached", position: [4, 1.5, 0], color: "#22D3EE" },
];

const connections: [string, string][] = [
  ["request", "cache"],
  ["cache", "mrl"],
  ["mrl", "router"],
  ["router", "model"],
];

function NodeMarker({ node }: { node: Node }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime * 0.5 + node.position[0]) * 0.15;
  });

  return (
    <mesh ref={ref} position={node.position}>
      <sphereGeometry args={[0.18, 24, 24]} />
      <meshStandardMaterial color={node.color} roughness={0.3} metalness={0.1} />
      <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div style={{ width: 140, textAlign: "center", transform: "translateY(28px)" }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#0A0A0A", fontFamily: "sans-serif" }}>{node.label}</div>
          <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "sans-serif" }}>{node.desc}</div>
        </div>
      </Html>
    </mesh>
  );
}

function Graph() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.25;
  });

  return (
    <group ref={groupRef}>
      {connections.map(([fromId, toId], i) => {
        const from = nodes.find((n) => n.id === fromId)!;
        const to = nodes.find((n) => n.id === toId)!;
        return (
          <Line
            key={i}
            points={[from.position, to.position]}
            color="#C7CDD9"
            lineWidth={1.5}
            transparent
            opacity={0.6}
          />
        );
      })}
      {nodes.map((n) => (
        <NodeMarker key={n.id} node={n} />
      ))}
    </group>
  );
}

function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <Graph />
    </Canvas>
  );
}

const Scene3DOnly = dynamic(() => Promise.resolve(Scene), { ssr: false });

export default function Blueprint() {
  return (
    <RevealSection>
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-semibold tracking-tight mb-2">How it all connects.</h2>
          <p className="text-[--text-secondary]">A single request's path through AITOL, start to finish.</p>
        </div>
        <div className="h-[420px] rounded-2xl border border-[--border] bg-[--surface]">
          <Scene3DOnly />
        </div>
      </section>
    </RevealSection>
  );
}