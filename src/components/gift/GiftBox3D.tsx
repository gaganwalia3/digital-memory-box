import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Sparkles, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface GiftBox3DProps {
  isOpen: boolean;
  onClick: () => void;
  theme?: "pink" | "ocean" | "midnight" | "gold";
  isRattling?: boolean;
}

const themeColors = {
  pink: { box: '#ffb6c1', ribbon: '#ffd700', sparkles: '#ffd700' },
  ocean: { box: '#0ea5e9', ribbon: '#e2e8f0', sparkles: '#38bdf8' },
  midnight: { box: '#0f172a', ribbon: '#e11d48', sparkles: '#f43f5e' },
  gold: { box: '#fef08a', ribbon: '#ffffff', sparkles: '#fbbf24' }
};

const BoxModel = ({ isOpen, onClick, theme = "pink", isRattling = false }: GiftBox3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);

  const ribbonLeftRef = useRef<THREE.Group>(null);
  const ribbonRightRef = useRef<THREE.Group>(null);
  const ribbonCenterRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);
  const colors = themeColors[theme] || themeColors.pink;

  useFrame((state) => {
    // Rattle effect if locked
    if (isRattling && !isOpen && groupRef.current) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 40) * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 40) * 0.02;
    } else if (groupRef.current) {
      groupRef.current.position.x += (0 - groupRef.current.position.x) * 0.1;
      groupRef.current.rotation.z += (0 - groupRef.current.rotation.z) * 0.1;
    }

    if (lidRef.current) {
      const targetLidY = isOpen ? 3.8 : 1.05;
      const targetLidRotX = isOpen ? -Math.PI / 8 : 0;
      const targetLidRotY = isOpen ? Math.PI / 6 : 0;
      const targetLidRotZ = isOpen ? Math.PI / 16 : 0;

      lidRef.current.position.y += (targetLidY - lidRef.current.position.y) * 0.08;
      lidRef.current.rotation.x += (targetLidRotX - lidRef.current.rotation.x) * 0.08;
      lidRef.current.rotation.y += (targetLidRotY - lidRef.current.rotation.y) * 0.08;
      lidRef.current.rotation.z += (targetLidRotZ - lidRef.current.rotation.z) * 0.08;
    }

    if (ribbonLeftRef.current && ribbonRightRef.current && ribbonCenterRef.current) {
      const tLX = isOpen ? -3 : 0;
      const tLY = isOpen ? 2 : 0;
      const tRX = isOpen ? 3 : 0;
      const tRY = isOpen ? 2 : 0;
      const tCY = isOpen ? 4 : 0;

      const tRot = isOpen ? Math.PI : 0;

      ribbonLeftRef.current.position.x += (tLX - ribbonLeftRef.current.position.x) * 0.08;
      ribbonLeftRef.current.position.y += (tLY - ribbonLeftRef.current.position.y) * 0.08;
      ribbonLeftRef.current.rotation.z += (-tRot - ribbonLeftRef.current.rotation.z) * 0.08;

      ribbonRightRef.current.position.x += (tRX - ribbonRightRef.current.position.x) * 0.08;
      ribbonRightRef.current.position.y += (tRY - ribbonRightRef.current.position.y) * 0.08;
      ribbonRightRef.current.rotation.z += (tRot - ribbonRightRef.current.rotation.z) * 0.08;

      ribbonCenterRef.current.position.y += (tCY - ribbonCenterRef.current.position.y) * 0.06;
      ribbonCenterRef.current.rotation.x += (tRot - ribbonCenterRef.current.rotation.x) * 0.06;
    }

    if (groupRef.current && !isRattling) {
      const scaleTarget = isOpen ? 0.9 : (hovered ? 1.05 : 1);
      groupRef.current.scale.x += (scaleTarget - groupRef.current.scale.x) * 0.1;
      groupRef.current.scale.y += (scaleTarget - groupRef.current.scale.y) * 0.1;
      groupRef.current.scale.z += (scaleTarget - groupRef.current.scale.z) * 0.1;
    }
  });

  const materialBox = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.box,
    roughness: 0.1,
    metalness: 0.1,
  }), [colors.box]);

  const materialRibbon = useMemo(() => new THREE.MeshStandardMaterial({
    color: colors.ribbon,
    roughness: 0.2,
    metalness: 0.8,
    envMapIntensity: 2
  }), [colors.ribbon]);

  return (
    <group
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      cursor={!isOpen ? "pointer" : "default"}
    >
      <Float speed={isOpen ? 0.001 : 2} rotationIntensity={isOpen ? 0.001 : 0.2} floatIntensity={isOpen ? 0.001 : 0.5}>

        <Sparkles visible={isOpen} count={120} scale={5} size={6} speed={0.5} opacity={0.8} color={colors.sparkles} />

        {/* BASE OF BOX */}
        <group position={[0, -0.5, 0]}>
          <RoundedBox args={[2, 2, 2]} radius={0.15} smoothness={4} material={materialBox} castShadow receiveShadow />
          <mesh position={[0, 0, 1.02]} material={materialRibbon} receiveShadow castShadow>
            <planeGeometry args={[0.4, 2]} />
          </mesh>
          <mesh position={[0, 0, -1.02]} material={materialRibbon} receiveShadow castShadow>
            <planeGeometry args={[0.4, 2]} />
          </mesh>
          <mesh position={[1.02, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={materialRibbon} receiveShadow castShadow>
            <planeGeometry args={[0.4, 2]} />
          </mesh>
          <mesh position={[-1.02, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={materialRibbon} receiveShadow castShadow>
            <planeGeometry args={[0.4, 2]} />
          </mesh>
          <mesh position={[0, -1.01, 0]} rotation={[Math.PI / 2, 0, 0]} material={materialRibbon} receiveShadow>
            <planeGeometry args={[0.4, 2]} />
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materialRibbon} receiveShadow>
              <planeGeometry args={[0.4, 2]} />
            </mesh>
          </mesh>
        </group>

        {/* LID OF BOX */}
        <group ref={lidRef} position={[0, 1.05, 0]}>
          <RoundedBox args={[2.1, 0.4, 2.1]} radius={0.1} smoothness={4} material={materialBox} castShadow receiveShadow />

          <mesh position={[0, 0.201, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materialRibbon} receiveShadow castShadow>
            <planeGeometry args={[0.4, 2.1]} />
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materialRibbon} receiveShadow castShadow>
              <planeGeometry args={[0.4, 2.1]} />
            </mesh>
          </mesh>

          {/* THE SEPARATED FLYING BOW */}
          <group position={[0, 0.2, 0]}>
            <group ref={ribbonLeftRef}>
              <mesh rotation={[0, 0, Math.PI / 4]} position={[0.3, 0.3, 0]} material={materialRibbon} castShadow>
                <torusGeometry args={[0.2, 0.08, 16, 32]} />
              </mesh>
            </group>

            <group ref={ribbonRightRef}>
              <mesh rotation={[0, 0, -Math.PI / 4]} position={[-0.3, 0.3, 0]} material={materialRibbon} castShadow>
                <torusGeometry args={[0.2, 0.08, 16, 32]} />
              </mesh>
            </group>

            <group ref={ribbonCenterRef}>
              <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.15, 0]} material={materialRibbon} castShadow>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
              </mesh>
            </group>
          </group>

        </group>

      </Float>
    </group>
  );
};

export default function GiftBox3D({ isOpen, onClick, theme = "pink", isRattling = false }: GiftBox3DProps) {
  return (
    <div className={`relative ${isOpen ? 'w-full h-full min-h-[300px]' : 'w-80 h-80'} transition-all duration-700 mx-auto pointer-events-auto`}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 2, 7], fov: 45 }} shadows gl={{ preserveDrawingBuffer: false, antialias: false }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-mapSize={256} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffffff" />

        <BoxModel isOpen={isOpen} onClick={onClick} theme={theme} isRattling={isRattling} />

        <group visible={!isOpen}>
          <ContactShadows frames={1} resolution={256} scale={10} blur={2} opacity={0.4} color="#000000" position={[0, -1.8, 0]} />
        </group>
      </Canvas>
    </div>
  );
}
