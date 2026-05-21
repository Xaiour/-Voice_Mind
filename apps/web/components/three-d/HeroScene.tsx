"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

function BrainModel({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const brainRef = useRef<THREE.Points>(null);
  const brainRefPurple = useRef<THREE.Points>(null);
  const particleCount = 1200;

  const [cyanPositions] = useState(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const isLeftLobe = Math.random() > 0.5;
      const lobeSign = isLeftLobe ? -0.35 : 0.35;

      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const shapeFactor = 1.2 + 0.35 * Math.sin(theta * 5) * Math.sin(phi * 7);

      let x = shapeFactor * Math.sin(phi) * Math.cos(theta);
      let y = shapeFactor * Math.cos(phi) * 0.8;
      let z = shapeFactor * Math.sin(phi) * Math.sin(theta);

      x += lobeSign;
      y += Math.sin(x * 4) * 0.2;
      z += Math.cos(y * 3) * 0.1;

      arr[i * 3] = x * 1.15;
      arr[i * 3 + 1] = y * 1.15;
      arr[i * 3 + 2] = z * 1.15;
    }
    return arr;
  });

  const [purplePositions] = useState(() => {
    const arr = new Float32Array((particleCount / 2) * 3);
    for (let i = 0; i < particleCount / 2; i++) {
      const isLeftLobe = Math.random() > 0.5;
      const lobeSign = isLeftLobe ? -0.35 : 0.35;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      const shapeFactor = 0.95 + 0.25 * Math.sin(theta * 6) * Math.sin(phi * 5);

      let x = shapeFactor * Math.sin(phi) * Math.cos(theta);
      let y = shapeFactor * Math.cos(phi) * 0.85;
      let z = shapeFactor * Math.sin(phi) * Math.sin(theta);

      x += lobeSign;
      y += Math.sin(x * 5) * 0.15;
      z += Math.cos(y * 4) * 0.1;

      arr[i * 3] = x * 1.1;
      arr[i * 3 + 1] = y * 1.1;
      arr[i * 3 + 2] = z * 1.1;
    }
    return arr;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollFactor = scrollRef.current * 0.0018;

    if (brainRef.current) {
      brainRef.current.rotation.y = time * 0.12 + scrollFactor;
      brainRef.current.rotation.x = Math.sin(time * 0.08) * 0.08 + scrollFactor * 0.4;
      const pulse = 1.0 + Math.sin(time * 2.5) * 0.025;
      brainRef.current.scale.set(pulse, pulse, pulse);
    }

    if (brainRefPurple.current) {
      brainRefPurple.current.rotation.y = -time * 0.08 + scrollFactor;
      brainRefPurple.current.rotation.x = -Math.sin(time * 0.05) * 0.05 + scrollFactor * 0.4;
      const pulse = 1.0 + Math.sin(time * 2.5) * 0.025;
      brainRefPurple.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      <Points ref={brainRef} positions={cyanPositions} stride={3}>
        <PointMaterial
          transparent
          color="#00f0ff"
          size={0.035}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      <Points ref={brainRefPurple} positions={purplePositions} stride={3}>
        <PointMaterial
          transparent
          color="#a855f7"
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function OrbitingParticles({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 250;

  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 2.2;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = height;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    const scrollSpeed = 1.0 + Math.min(scrollRef.current * 0.015, 8.0);
    pointsRef.current.rotation.y = -time * 0.22 * scrollSpeed;

    const expansion = 1.0 + Math.min(scrollRef.current * 0.0008, 1.2);
    pointsRef.current.scale.set(expansion, 1, expansion);
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#ff007a"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export default function HeroScene() {
  const scrollRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="w-64 h-64 rounded-full border border-dashed border-neon-cyan/20 animate-spin" style={{ animationDuration: "12s" }} />
        <div className="absolute w-48 h-48 rounded-full border border-dotted border-neon-purple/30 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[480px] relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <Float speed={2.5} floatIntensity={0.5} rotationIntensity={0.3}>
          <BrainModel scrollRef={scrollRef} />
          <OrbitingParticles scrollRef={scrollRef} />
        </Float>
      </Canvas>
    </div>
  );
}
