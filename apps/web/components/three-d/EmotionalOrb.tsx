"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

type EmotionType = "calm" | "energetic" | "anxious" | "joyful";

interface EmotionalOrbProps {
  emotion?: EmotionType;
  interactive?: boolean;
}

const colorMap: Record<EmotionType, string> = {
  calm: "#00f0ff",
  energetic: "#ff007a",
  anxious: "#7000ff",
  joyful: "#ffd700",
};

const settingsMap: Record<EmotionType, { distort: number; speed: number; roughness: number }> = {
  calm: { distort: 0.22, speed: 1.2, roughness: 0.2 },
  energetic: { distort: 0.55, speed: 4.2, roughness: 0.4 },
  anxious: { distort: 0.48, speed: 2.8, roughness: 0.5 },
  joyful: { distort: 0.38, speed: 2.2, roughness: 0.1 },
};

function OrbMesh({ emotion, interactive }: { emotion: EmotionType; interactive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const currentDistort = useRef(settingsMap.calm.distort);
  const currentSpeed = useRef(settingsMap.calm.speed);

  useEffect(() => {
    if (!interactive) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const time = state.clock.getElapsedTime();

    const targetColor = new THREE.Color(colorMap[emotion]);
    materialRef.current.color.lerp(targetColor, 0.08);

    const targetSettings = settingsMap[emotion];
    currentDistort.current += (targetSettings.distort - currentDistort.current) * 0.08;
    currentSpeed.current += (targetSettings.speed - currentSpeed.current) * 0.08;

    materialRef.current.distort = currentDistort.current;
    materialRef.current.speed = currentSpeed.current;

    if (interactive) {
      meshRef.current.rotation.y = time * 0.4 + mouseRef.current.x * 0.5;
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.2 + mouseRef.current.y * 0.5;
    } else {
      meshRef.current.rotation.y = time * 0.3;
      meshRef.current.rotation.x = Math.sin(time * 0.15) * 0.15;
    }

    const pulseFactor = emotion === "energetic" ? 0.06 : 0.03;
    const pulseSpeed = emotion === "energetic" ? 4.0 : 2.0;
    const scale = 1.4 + Math.sin(time * pulseSpeed) * pulseFactor;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        ref={materialRef}
        color={colorMap[emotion]}
        distort={settingsMap[emotion].distort}
        speed={settingsMap[emotion].speed}
        roughness={settingsMap[emotion].roughness}
        metalness={0.8}
      />
    </mesh>
  );
}

export default function EmotionalOrb({ emotion = "calm", interactive = false }: EmotionalOrbProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    const stylesMap2D: Record<EmotionType, string> = {
      calm: "from-cyan-400 to-blue-500 shadow-[0_0_50px_rgba(6,182,212,0.4)]",
      energetic: "from-pink-500 to-rose-600 shadow-[0_0_50px_rgba(244,63,94,0.5)]",
      anxious: "from-purple-500 to-indigo-600 shadow-[0_0_50px_rgba(168,85,247,0.4)]",
      joyful: "from-yellow-400 to-amber-500 shadow-[0_0_50px_rgba(234,179,8,0.4)]",
    };

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-40 h-40 rounded-full bg-gradient-to-tr ${stylesMap2D[emotion]} blur-[2px] animate-pulse`} />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[280px] relative">
      <Canvas camera={{ position: [0, 0, 4.0], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color={colorMap[emotion]} />
        <Float speed={1.5} floatIntensity={0.2} rotationIntensity={0.2}>
          <OrbMesh emotion={emotion} interactive={interactive} />
        </Float>
      </Canvas>
    </div>
  );
}
