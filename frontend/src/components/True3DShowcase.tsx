"use client";

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, ContactShadows, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// --- 3D Models Built with Primitives ---

function PhoneModel() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Phone Body */}
      <RoundedBox args={[1.6, 3.2, 0.2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </RoundedBox>
      {/* Screen */}
      <mesh position={[0, 0, 0.105]}>
        <planeGeometry args={[1.4, 3.0]} />
        <meshStandardMaterial color="#0284c7" emissive="#0ea5e9" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function WatchModel() {
  return (
    <group rotation={[Math.PI / 4, 0, 0]}>
      {/* Band */}
      <mesh>
        <torusGeometry args={[1.2, 0.2, 16, 100]} />
        <meshStandardMaterial color="#f59e0b" metalness={1} roughness={0.2} />
      </mesh>
      {/* Face Base */}
      <mesh position={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.9, 0.9, 0.3, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Face Glass */}
      <mesh position={[0, 0, 0.31]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#000000" emissive="#10b981" emissiveIntensity={0.2} metalness={1} roughness={0} />
      </mesh>
    </group>
  );
}

function ShoeModel() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Sole */}
      <RoundedBox args={[1.4, 0.5, 3.2]} position={[0, -0.25, 0]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </RoundedBox>
      {/* Upper Main */}
      <RoundedBox args={[1.2, 1.2, 2.5]} position={[0, 0.6, -0.2]} radius={0.4} smoothness={4}>
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </RoundedBox>
      {/* Toe */}
      <RoundedBox args={[1.2, 0.8, 1]} position={[0, 0.4, 1.1]} radius={0.3} smoothness={4}>
        <meshStandardMaterial color="#b91c1c" roughness={0.5} />
      </RoundedBox>
    </group>
  );
}

function ClothesModel() {
  return (
    <group position={[0, 0.5, 0]}>
      {/* Torso */}
      <RoundedBox args={[2, 2.8, 0.4]} position={[0, -1, 0]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#6366f1" roughness={0.8} />
      </RoundedBox>
      {/* Left Sleeve */}
      <RoundedBox args={[1.2, 0.8, 0.4]} position={[-1.5, 0.1, 0]} rotation={[0, 0, 0.4]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#6366f1" roughness={0.8} />
      </RoundedBox>
      {/* Right Sleeve */}
      <RoundedBox args={[1.2, 0.8, 0.4]} position={[1.5, 0.1, 0]} rotation={[0, 0, -0.4]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#6366f1" roughness={0.8} />
      </RoundedBox>
      {/* Collar Detail */}
      <RoundedBox args={[1, 0.3, 0.5]} position={[0, 0.4, 0]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#4338ca" roughness={0.8} />
      </RoundedBox>
    </group>
  );
}

const products = [
  { id: 1, name: "Pro Vision X", category: "Phones", Component: PhoneModel, color: "from-blue-500/20 to-cyan-600/20" },
  { id: 2, name: "Air Max Infinity", category: "Shoes", Component: ShoeModel, color: "from-red-500/20 to-rose-600/20" },
  { id: 3, name: "Urban Threads", category: "Clothes", Component: ClothesModel, color: "from-indigo-500/20 to-purple-600/20" },
  { id: 4, name: "Chrono Elite", category: "Watches", Component: WatchModel, color: "from-amber-500/20 to-orange-600/20" },
];

function ModelRenderer({ currentIndex }: { currentIndex: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const CurrentModel = products[currentIndex].Component;

  // Slowly rotate the active model
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <Float speed={3} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={groupRef}>
        <CurrentModel />
      </group>
    </Float>
  );
}

export default function True3DShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Faster animation cycle: 2 seconds instead of 4
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 2000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-[450px] w-full max-w-md flex-col items-center justify-center">
      
      {/* Glass overlay background for aesthetic */}
      <div className="absolute inset-0 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${products[currentIndex].color} transition-colors duration-1000`} />
      </div>

      {/* The 3D Canvas */}
      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" />
          
          <ModelRenderer currentIndex={currentIndex} />
          
          <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2} far={4} />
        </Canvas>
      </div>

      {/* Product Details - placed nicely at the bottom over the canvas */}
      <div className="absolute bottom-8 left-8 right-8 z-20 text-white pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-300 drop-shadow-md">
              {products[currentIndex].category}
            </span>
            <h3 className="mt-1 text-3xl font-bold tracking-tight text-white drop-shadow-lg">
              {products[currentIndex].name}
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicators */}
        <div className="mt-6 flex gap-3">
          {products.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-brand-400" : "w-3 bg-white/30"}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
