"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function WaveMesh({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  useFrame((state) => {
    if (!geomRef.current) return;
    const time = state.clock.getElapsedTime();
    const posAttr = geomRef.current.attributes.position;
    const count = posAttr.count;

    const mx = mouse.current.x;
    const my = mouse.current.y;

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);

      const distance = Math.sqrt(x * x + y * y);

      const z = Math.sin(distance * (0.8 + mx * 0.4) - time * 1.8) * (0.45 + my * 0.25) +
                Math.cos(x * 1.2 + time) * Math.sin(y * 1.2 + time) * 0.15;

      posAttr.setZ(i, z);
    }

    posAttr.needsUpdate = true;

    if (meshRef.current) {
      meshRef.current.rotation.z = time * 0.04;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.8, 0, 0]}>
      <planeGeometry ref={geomRef} args={[10, 8, 45, 35]} />
      <meshBasicMaterial
        color="#a855f7"
        wireframe
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function SoundWaveMesh() {
  const mouse = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      mouse.current.x += (x - mouse.current.x) * 0.08;
      mouse.current.y += (y - mouse.current.y) * 0.08;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-25">
        <div className="flex space-x-2">
          <div className="w-2 h-16 bg-neon-purple rounded animate-pulse" />
          <div className="w-2 h-24 bg-neon-cyan rounded animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-32 bg-neon-pink rounded animate-pulse" style={{ animationDelay: "0.4s" }} />
          <div className="w-2 h-20 bg-neon-purple rounded animate-pulse" style={{ animationDelay: "0.6s" }} />
          <div className="w-2 h-10 bg-neon-cyan rounded animate-pulse" style={{ animationDelay: "0.8s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] relative">
      <Canvas camera={{ position: [0, 3.5, 5.5], fov: 50 }} gl={{ alpha: true }}>
        <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0.1}>
          <WaveMesh mouse={mouse} />
        </Float>
      </Canvas>
    </div>
  );
}
